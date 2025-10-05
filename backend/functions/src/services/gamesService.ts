/**
 * Games Service
 * Handles game logic, scoring, and anti-abuse measures
 */

import {BaseService} from "./baseService";
import {Game, GameScore} from "../types";
import {validateRequiredFields} from "../lib/validators";
import {capsAndLimits} from "../lib/capsAndLimits";
import {fraudDetection} from "../lib/fraudDetection";
import {walletService} from "./walletService";

const DAILY_EARN_CAP = 1000; // Max coins a user can earn from games per day
const MIN_PLAY_TIME_SECONDS = 30; // Minimum play time to prevent rapid submissions
const GAME_COOLDOWN_MINUTES = 5; // Cooldown period between playing the same game
const DAILY_GAME_ATTEMPT_LIMIT = 10; // Max attempts per game per day

export class GamesService extends BaseService {
  /**
   * Get all available games
   */
  async getGames(): Promise<Game[]> {
    return this.executeWithMetrics(
      async () => {
        const snapshot = await this.db
          .collection("games")
          .where("isActive", "==", true)
          .orderBy("name")
          .get();

        return snapshot.docs.map((doc) =>
          this.convertFromFirestore(doc.data()) as Game
        );
      },
      "games_get_all",
      {},
      "games"
    );
  }

  /**
   * Get game by ID with configuration
   */
  async getGame(gameId: string): Promise<Game & { config: any }> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({gameId}, ["gameId"]);

        const gameDoc = await this.db.collection("games").doc(gameId).get();

        if (!gameDoc.exists) {
          throw new Error("Game not found");
        }

        const game = this.convertFromFirestore(gameDoc.data()) as Game;

        if (!game.isActive) {
          throw new Error("Game is not active");
        }

        return {
          ...game,
          config: game.config || {},
        };
      },
      "games_get_by_id",
      {gameId},
      "games"
    );
  }

  /**
   * Complete a game and calculate score
   */
  async completeGame(
    userId: string,
    gameId: string,
    clientData: any,
    playTime: number
  ): Promise<GameScore> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId, gameId, clientData, playTime}, ["userId", "gameId", "clientData", "playTime"]);

        // Get game details
        const game = await this.getGame(gameId);

        // Validate play time
        if (playTime < MIN_PLAY_TIME_SECONDS) {
          throw new Error(`Minimum play time is ${MIN_PLAY_TIME_SECONDS} seconds`);
        }

        // Check game cooldown
        const cooldownCheck = await this.checkGameCooldown(userId, gameId);
        if (!cooldownCheck.allowed) {
          throw new Error(`Game cooldown active. Try again in ${cooldownCheck.remainingMinutes} minutes`);
        }

        // Check daily attempt limit
        const attemptCheck = await this.checkDailyAttemptLimit(userId, gameId);
        if (!attemptCheck.allowed) {
          throw new Error(`Daily attempt limit reached. Max: ${DAILY_GAME_ATTEMPT_LIMIT} attempts per game`);
        }

        // Calculate score based on game type
        const score = await this.calculateScore(game, clientData, playTime);

        // Validate score
        if (score < 0 || score > (game.coinsReward || 0)) {
          throw new Error(`Invalid score. Must be between 0 and ${game.coinsReward}`);
        }

        // Check for duplicate submission
        const isDuplicate = await fraudDetection.checkDuplicateGameSubmission(userId, gameId, score, playTime);
        if (isDuplicate) {
          throw new Error("Duplicate game submission detected");
        }

        // Check daily earning cap
        const dailyEarned = await capsAndLimits.getDailyEarned(userId);
        if (dailyEarned + score > DAILY_EARN_CAP) {
          throw new Error(`Daily earning cap exceeded. Max: ${DAILY_EARN_CAP} coins per day`);
        }

        // Create game score record
        const gameScore: GameScore = {
          scoreId: this.db.collection("gameScores").doc().id,
          userId,
          gameId,
          gameType: game.type,
          gameName: game.title,
          score,
          maxScore: game.config?.maxScore || 100,
          percentage: Math.round((score / (game.config?.maxScore || 100)) * 100),
          completionTime: playTime,
          timeSpent: playTime,
          attempts: 1,
          coinsEarned: score,
          completedAt: new Date().toISOString(),
          metadata: {
            answers: clientData,
            achievements: [],
            analytics: {},
          },
          createdAt: new Date().toISOString(),
        };

        // Earn coins from wallet service
        await walletService.earnCoins(userId, gameId, score);

        // Update leaderboards
        await this.updateLeaderboards(gameScore);

        // Save game score
        await this.db.collection("gameScores").doc(gameScore.scoreId).set(
          this.sanitizeForFirestore(gameScore)
        );

        // Log audit trail
        await this.logAudit(
          "gameCompleted",
          userId,
          userId,
          {gameId, score, playTime},
          gameScore,
          "GamesService:completeGame"
        );

        // Log activity
        await this.logActivity(
          userId,
          "gameCompleted",
          {gameId, gameName: game.title, score, playTime, coinsEarned: score},
          "games"
        );

        return gameScore;
      },
      "games_complete",
      {userId, gameId, playTime},
      "games"
    );
  }

  /**
   * Get user's game history
   */
  async getGameHistory(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: GameScore[]; pagination: any }> {
    return this.executeWithMetrics(
      async () => {
        const offset = (page - 1) * limit;

        const query = this.db
          .collection("gameScores")
          .where("userId", "==", userId)
          .orderBy("completedAt", "desc")
          .limit(limit)
          .offset(offset);

        const snapshot = await query.get();
        const scores = snapshot.docs.map((doc) =>
          this.convertFromFirestore(doc.data()) as GameScore
        );

        // Get total count for pagination
        const totalSnapshot = await this.db
          .collection("gameScores")
          .where("userId", "==", userId)
          .get();

        const total = totalSnapshot.size;

        return {
          data: scores,
          pagination: {
            page,
            limit,
            total,
            hasNext: offset + limit < total,
            hasPrev: page > 1,
          },
        };
      },
      "games_get_history",
      {userId, page, limit},
      "games"
    );
  }

  /**
   * Get game leaderboard
   */
  async getLeaderboard(gameId: string, limit: number = 10): Promise<GameScore[]> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({gameId}, ["gameId"]);

        const query = this.db
          .collection("gameScores")
          .where("gameId", "==", gameId)
          .orderBy("score", "desc")
          .orderBy("completedAt", "asc") // Earlier completion wins ties
          .limit(limit);

        const snapshot = await query.get();

        return snapshot.docs.map((doc) =>
          this.convertFromFirestore(doc.data()) as GameScore
        );
      },
      "games_get_leaderboard",
      {gameId, limit},
      "games"
    );
  }

  /**
   * Calculate score based on game type and client data
   */
  private async calculateScore(game: Game, clientData: any, playTime: number): Promise<number> {
    switch (game.type) {
    case "quiz":
      return this.calculateQuizScore(game, clientData, playTime);
    case "dragdrop":
      return this.calculateDragDropScore(game, clientData, playTime);
    case "simulation":
      return this.calculateSimulationScore(game, clientData, playTime);
    default:
      throw new Error(`Unsupported game type: ${game.type}`);
    }
  }

  /**
   * Calculate quiz score
   */
  private calculateQuizScore(game: Game, clientData: any, playTime: number): number {
    const {answers} = clientData;
    const {questions} = game.config;

    if (!answers || !Array.isArray(answers)) {
      throw new Error("Invalid quiz answers");
    }

    let correctAnswers = 0;
    let totalPoints = 0;

    questions.forEach((question: any, index: number) => {
      const userAnswer = answers[index];
      if (userAnswer && userAnswer.answer === question.correctAnswer) {
        correctAnswers++;
        totalPoints += question.points || 10;
      }
    });

    // Bonus points for speed (if completed within time limit)
    const timeBonus = playTime <= (game.config.timeLimit || 300) ? 10 : 0;

    return Math.min(totalPoints + timeBonus, game.coinsReward || 0);
  }

  /**
   * Calculate drag-drop score
   */
  private calculateDragDropScore(game: Game, clientData: any, playTime: number): number {
    const {placements} = clientData;
    const {items} = game.config;

    if (!placements || !Array.isArray(placements)) {
      throw new Error("Invalid drag-drop placements");
    }

    let correctPlacements = 0;
    let totalPoints = 0;

    placements.forEach((placement: any) => {
      const item = items.find((i: any) => i.id === placement.itemId);
      if (item && placement.binId === item.category) {
        correctPlacements++;
        totalPoints += item.points || 10;
      }
    });

    // Bonus points for speed
    const timeBonus = playTime <= (game.config.timeLimit || 180) ? 15 : 0;

    return Math.min(totalPoints + timeBonus, game.coinsReward || 0);
  }

  /**
   * Calculate simulation score
   */
  private calculateSimulationScore(game: Game, clientData: any, playTime: number): number {
    const {actions} = clientData;
    const {scenarios} = game.config;

    if (!actions || !Array.isArray(actions)) {
      throw new Error("Invalid simulation actions");
    }

    let totalPoints = 0;
    let co2Saved = 0;

    actions.forEach((action: any) => {
      const scenario = scenarios[0]; // Assuming single scenario for now
      const task = scenario.tasks.find((t: any) => t.id === action.taskId);

      if (task && action.completed) {
        totalPoints += task.points || 20;
        co2Saved += task.co2Saved || 0;
      }
    });

    // Bonus points for efficiency
    const efficiencyBonus = co2Saved > 100 ? 25 : 0;

    return Math.min(totalPoints + efficiencyBonus, game.coinsReward || 0);
  }

  /**
   * Check game cooldown
   */
  private async checkGameCooldown(userId: string, gameId: string): Promise<{ allowed: boolean; remainingMinutes: number }> {
    const cooldownTime = new Date(Date.now() - GAME_COOLDOWN_MINUTES * 60 * 1000);

    const snapshot = await this.db
      .collection("gameScores")
      .where("userId", "==", userId)
      .where("gameId", "==", gameId)
      .where("completedAt", ">=", cooldownTime)
      .get();

    if (snapshot.empty) {
      return {allowed: true, remainingMinutes: 0};
    }

    const lastPlay = snapshot.docs[0].data().completedAt.toDate();
    const remainingMs = (lastPlay.getTime() + GAME_COOLDOWN_MINUTES * 60 * 1000) - Date.now();
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));

    return {
      allowed: remainingMinutes <= 0,
      remainingMinutes: Math.max(0, remainingMinutes),
    };
  }

  /**
   * Check daily attempt limit
   */
  private async checkDailyAttemptLimit(userId: string, gameId: string): Promise<{ allowed: boolean; attempts: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const snapshot = await this.db
      .collection("gameScores")
      .where("userId", "==", userId)
      .where("gameId", "==", gameId)
      .where("completedAt", ">=", today)
      .get();

    const attempts = snapshot.size;

    return {
      allowed: attempts < DAILY_GAME_ATTEMPT_LIMIT,
      attempts,
    };
  }

  /**
   * Update leaderboards
   */
  private async updateLeaderboards(gameScore: GameScore): Promise<void> {
    // Update global leaderboard
    await this.updateGlobalLeaderboard(gameScore);

    // Update game-specific leaderboard
    await this.updateGameLeaderboard(gameScore);

    // Update user's best score if applicable
    await this.updateUserBestScore(gameScore);
  }

  /**
   * Update global leaderboard
   */
  private async updateGlobalLeaderboard(gameScore: GameScore): Promise<void> {
    const leaderboardRef = this.db.collection("leaderboards").doc("global");

    await leaderboardRef.set({
      gameId: gameScore.gameId,
      gameName: gameScore.gameName,
      userId: gameScore.userId,
      score: gameScore.score,
      completedAt: gameScore.completedAt,
      updatedAt: new Date(),
    }, {merge: true});
  }

  /**
   * Update game-specific leaderboard
   */
  private async updateGameLeaderboard(gameScore: GameScore): Promise<void> {
    const leaderboardRef = this.db.collection("leaderboards").doc(`game_${gameScore.gameId}`);

    await leaderboardRef.set({
      gameId: gameScore.gameId,
      gameName: gameScore.gameName,
      userId: gameScore.userId,
      score: gameScore.score,
      completedAt: gameScore.completedAt,
      updatedAt: new Date(),
    }, {merge: true});
  }

  /**
   * Update user's best score
   */
  private async updateUserBestScore(gameScore: GameScore): Promise<void> {
    const userBestRef = this.db.collection("userBestScores").doc(`${gameScore.userId}_${gameScore.gameId}`);

    const existingBest = await userBestRef.get();

    if (!existingBest.exists || existingBest.data()!.score < gameScore.score) {
      await userBestRef.set({
        userId: gameScore.userId,
        gameId: gameScore.gameId,
        gameName: gameScore.gameName,
        score: gameScore.score,
        completedAt: gameScore.completedAt,
        updatedAt: new Date(),
      });
    }
  }
}

export const gamesService = new GamesService();
