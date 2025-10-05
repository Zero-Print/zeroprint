/**
 * Game Service - isolates Firestore operations for game management
 */

import {BaseService} from "./baseService";
import {Game, GameScore} from "../types";
import {validateRequiredFields} from "../lib/validators";

export class GameService extends BaseService {
  async getGames(): Promise<Game[]> {
    return this.executeWithMetrics(
      async () => {
        const games = await this.db
          .collection("games")
          .where("isActive", "==", true)
          .get();

        return games.docs.map((doc) =>
          this.convertFromFirestore(doc.data()) as Game
        );
      },
      "game_get_games",
      {},
      "games"
    );
  }

  async getGame(id: string): Promise<Game> {
    return this.executeWithMetrics(
      async () => {
        const gameDoc = await this.db.collection("games").doc(id).get();

        if (!gameDoc.exists) {
          throw new Error("Game not found");
        }

        return this.convertFromFirestore(gameDoc.data()) as Game;
      },
      "game_get_game",
      {id},
      "games"
    );
  }

  async completeGame(userId: string, gameId: string, score: number): Promise<GameScore> {
    return this.executeWithMetrics(
      async () => {
        validateRequiredFields({userId, gameId, score}, ["userId", "gameId", "score"]);

        // Get game details
        const game = await this.getGame(gameId);

        // Calculate coins earned based on score
        const maxScore = game.config.maxAttempts || 100;
        const coinsEarned = Math.floor((score / maxScore) * (game.coinsReward || 0));

        // Create game score record
        const gameScore: GameScore = {
          scoreId: this.db.collection("gameScores").doc().id,
          userId,
          gameId,
          gameType: game.type,
          gameName: game.title,
          score,
          maxScore,
          percentage: Math.round((score / maxScore) * 100),
          coinsEarned,
          completedAt: new Date().toISOString(),
          attempts: 1, // Would be tracked
          completionTime: 0, // Would be calculated from start/end times
          timeSpent: 0,
          metadata: {
            answers: {},
            achievements: [],
            analytics: {},
          },
          createdAt: new Date().toISOString(),
        };

        // Save to Firestore
        await this.db.collection("gameScores").doc(gameScore.scoreId).set(
          this.sanitizeForFirestore(gameScore)
        );

        // Update wallet if coins earned
        if (coinsEarned > 0) {
          const walletService = new (await import("./walletService")).WalletService();
          await walletService.earnCoins(userId, gameId, coinsEarned);
        }

        // Log activity
        await this.logActivity(
          userId,
          "gameCompleted",
          {gameId, score, coinsEarned},
          "games"
        );

        return gameScore;
      },
      "game_complete",
      {userId, gameId, score},
      "games"
    );
  }
}
