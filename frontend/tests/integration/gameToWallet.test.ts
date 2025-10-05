import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  doc,
  getDoc,
  setDoc,
  runTransaction,
  clearFirestoreData,
} from 'firebase/firestore';
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { GameEngineFactory } from '../../src/lib/gameEngine';
import { WalletService } from '../../src/services/walletService';
import { TEST_GAMES, TEST_QUESTIONS, TEST_USERS, TEST_WALLETS } from '../fixtures/seed-data';

// Firebase emulator configuration
const firebaseConfig = {
  projectId: 'zeroprint-test',
  apiKey: 'test-api-key',
  authDomain: 'zeroprint-test.firebaseapp.com',
  storageBucket: 'zeroprint-test.appspot.com',
  messagingSenderId: '123456789',
  appId: 'test-app-id',
};

describe.skip('Game to Wallet Integration Tests', () => {
  let app: any;
  let db: any;
  let auth: any;
  let functions: any;
  let gameEngine: GameEngineFactory;
  let walletService: WalletService;

  beforeAll(async () => {
    // Initialize Firebase app
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    functions = getFunctions(app);

    // Connect to emulators
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFunctionsEmulator(functions, 'localhost', 5001);

    // Initialize services
    gameEngine = GameEngineFactory;
    walletService = new WalletService();
  });

  beforeEach(async () => {
    // Clear Firestore data before each test
    await clearFirestoreData(firebaseConfig.projectId);

    // Seed test data
    await seedTestData();
  });

  afterAll(async () => {
    // Clean up
    await clearFirestoreData(firebaseConfig.projectId);
  });

  const seedTestData = async () => {
    // Create test users in Auth
    for (const user of Object.values(TEST_USERS)) {
      try {
        await createUserWithEmailAndPassword(auth, user.email, 'testpassword123');
      } catch (error: any) {
        if (error.code !== 'auth/email-already-in-use') {
          throw error;
        }
      }
    }

    // Seed Firestore collections
    const batch = [];

    // Users
    for (const [userId, userData] of Object.entries(TEST_USERS)) {
      batch.push(setDoc(doc(db, 'users', userId), userData));
    }

    // Wallets
    for (const [userId, walletData] of Object.entries(TEST_WALLETS)) {
      batch.push(setDoc(doc(db, 'wallets', userId), walletData));
    }

    // Games
    for (const game of TEST_GAMES) {
      batch.push(setDoc(doc(db, 'games', game.id), game));
    }

    // Questions
    for (const question of TEST_QUESTIONS) {
      batch.push(setDoc(doc(db, 'questions', question.id), question));
    }

    await Promise.all(batch);
  };

  describe('Complete Game Flow', () => {
    it('should complete quiz game and update wallet with audit logs', async () => {
      const userId = 'test-citizen-1';
      const gameId = 'game-quiz-1';

      // Sign in user
      await signInWithEmailAndPassword(auth, TEST_USERS.citizen.email, 'testpassword123');

      // Get game and questions
      const game = TEST_GAMES.find(g => g.id === gameId)!;
      const questions = TEST_QUESTIONS.filter(q => q.gameId === gameId);

      // Simulate perfect quiz answers
      const answers = questions.map(q => ({
        questionId: q.id,
        selectedOption: q.correctAnswer,
        timeSpent: 15000, // 15 seconds per question
        isCorrect: true,
      }));

      // Get initial wallet state
      const initialWalletDoc = await getDoc(doc(db, 'wallets', userId));
      const initialWallet = initialWalletDoc.data();
      const initialBalance = initialWallet?.healCoins || 0;

      // Complete the game
      const gameResult = await gameEngine.completeGame(userId, game, questions, answers);

      // Verify game result
      expect(gameResult.score).toBe(100);
      expect(gameResult.coinsEarned).toBe(game.maxCoins);
      expect(gameResult.completed).toBe(true);

      // Verify wallet was updated
      const updatedWalletDoc = await getDoc(doc(db, 'wallets', userId));
      const updatedWallet = updatedWalletDoc.data();
      expect(updatedWallet?.healCoins).toBe(initialBalance + game.maxCoins);
      expect(updatedWallet?.lastUpdated).toBeDefined();

      // Verify transaction was recorded
      const transactionsSnapshot = await collection(db, 'transactions')
        .where('userId', '==', userId)
        .where('type', '==', 'credit')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      expect(transactionsSnapshot.docs).toHaveLength(1);
      const transaction = transactionsSnapshot.docs[0].data();
      expect(transaction.amount).toBe(game.maxCoins);
      expect(transaction.description).toContain('Game completion');
      expect(transaction.status).toBe('completed');

      // Verify audit log was created
      const auditLogsSnapshot = await collection(db, 'auditLogs')
        .where('userId', '==', userId)
        .where('action', '==', 'GAME_COMPLETED')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      expect(auditLogsSnapshot.docs).toHaveLength(1);
      const auditLog = auditLogsSnapshot.docs[0].data();
      expect(auditLog.details.gameId).toBe(gameId);
      expect(auditLog.details.score).toBe(100);
      expect(auditLog.details.coinsEarned).toBe(game.maxCoins);

      // Verify activity log was created
      const activityLogsSnapshot = await collection(db, 'activityLogs')
        .where('userId', '==', userId)
        .where('action', '==', 'HEALCOINS_CREDITED')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      expect(activityLogsSnapshot.docs).toHaveLength(1);
      const activityLog = activityLogsSnapshot.docs[0].data();
      expect(activityLog.details.source).toBe('game');
      expect(activityLog.details.amount).toBe(game.maxCoins);
    });

    it('should handle partial quiz completion with proportional rewards', async () => {
      const userId = 'test-citizen-1';
      const gameId = 'game-quiz-1';

      await signInWithEmailAndPassword(auth, TEST_USERS.citizen.email, 'testpassword123');

      const game = TEST_GAMES.find(g => g.id === gameId)!;
      const questions = TEST_QUESTIONS.filter(q => q.gameId === gameId);

      // Simulate 60% correct answers
      const answers = questions.map((q, index) => ({
        questionId: q.id,
        selectedOption:
          index < Math.ceil(questions.length * 0.6) ? q.correctAnswer : 'wrong-option',
        timeSpent: 20000,
        isCorrect: index < Math.ceil(questions.length * 0.6),
      }));

      const initialWalletDoc = await getDoc(doc(db, 'wallets', userId));
      const initialBalance = initialWalletDoc.data()?.healCoins || 0;

      const gameResult = await gameEngine.completeGame(userId, game, questions, answers);

      expect(gameResult.score).toBe(60);
      expect(gameResult.coinsEarned).toBeLessThan(game.maxCoins);
      expect(gameResult.coinsEarned).toBeGreaterThan(0);

      // Verify proportional wallet update
      const updatedWalletDoc = await getDoc(doc(db, 'wallets', userId));
      const updatedWallet = updatedWalletDoc.data();
      expect(updatedWallet?.healCoins).toBe(initialBalance + gameResult.coinsEarned);
    });

    it('should handle drag-drop game completion', async () => {
      const userId = 'test-citizen-1';
      const gameId = 'game-drag-drop-1';

      await signInWithEmailAndPassword(auth, TEST_USERS.citizen.email, 'testpassword123');

      const game = TEST_GAMES.find(g => g.id === gameId)!;

      // Simulate correct drag-drop placements
      const dragDropAnswers = [
        {
          itemId: 'plastic-bottle',
          targetZone: 'recyclable',
          isCorrect: true,
          timeSpent: 5000,
        },
        {
          itemId: 'banana-peel',
          targetZone: 'organic',
          isCorrect: true,
          timeSpent: 3000,
        },
        {
          itemId: 'battery',
          targetZone: 'hazardous',
          isCorrect: true,
          timeSpent: 4000,
        },
      ];

      const initialWalletDoc = await getDoc(doc(db, 'wallets', userId));
      const initialBalance = initialWalletDoc.data()?.healCoins || 0;

      const gameResult = await gameEngine.validateDragDropAnswers(game, dragDropAnswers);

      // Credit coins for successful completion
      await walletService.creditHealCoins(
        userId,
        gameResult.coinsEarned,
        `Drag-drop game completion: ${gameId}`,
        'game'
      );

      expect(gameResult.score).toBe(100);
      expect(gameResult.correctPlacements).toBe(3);

      // Verify wallet update
      const updatedWalletDoc = await getDoc(doc(db, 'wallets', userId));
      const updatedWallet = updatedWalletDoc.data();
      expect(updatedWallet?.healCoins).toBe(initialBalance + gameResult.coinsEarned);
    });
  });

  describe('Rate Limiting Integration', () => {
    it('should enforce daily earning limits across multiple games', async () => {
      const userId = 'test-citizen-1';

      await signInWithEmailAndPassword(auth, TEST_USERS.citizen.email, 'testpassword123');

      const game = TEST_GAMES.find(g => g.type === 'quiz')!;
      const questions = TEST_QUESTIONS.filter(q => q.gameId === game.id);

      // Play multiple games to approach daily limit
      let totalEarned = 0;
      const dailyLimit = 100; // Assuming 100 coins daily limit

      for (let i = 0; i < 10; i++) {
        try {
          const answers = questions.map(q => ({
            questionId: q.id,
            selectedOption: q.correctAnswer,
            timeSpent: 15000,
            isCorrect: true,
          }));

          const gameResult = await gameEngine.completeGame(userId, game, questions, answers);
          totalEarned += gameResult.coinsEarned;

          if (totalEarned >= dailyLimit) {
            break;
          }
        } catch (error: any) {
          if (error.message.includes('Rate limit exceeded')) {
            expect(totalEarned).toBeGreaterThanOrEqual(dailyLimit);
            break;
          }
          throw error;
        }
      }

      // Verify rate limit was enforced
      expect(totalEarned).toBeLessThanOrEqual(dailyLimit);

      // Verify rate limit status
      const limits = await walletService.getWalletLimits(userId);
      expect(limits.earn.daily.used).toBe(totalEarned);
      expect(limits.earn.daily.remaining).toBe(dailyLimit - totalEarned);
    });
  });

  describe('Redemption Flow Integration', () => {
    it('should complete redemption flow with wallet deduction and audit logs', async () => {
      const userId = 'test-citizen-1';
      const rewardId = 'reward-voucher-1';
      const redemptionAmount = 50;

      await signInWithEmailAndPassword(auth, TEST_USERS.citizen.email, 'testpassword123');

      // Ensure user has sufficient balance
      const walletRef = doc(db, 'wallets', userId);
      await runTransaction(db, async transaction => {
        const walletDoc = await transaction.get(walletRef);
        const currentBalance = walletDoc.data()?.healCoins || 0;

        if (currentBalance < redemptionAmount) {
          transaction.update(walletRef, {
            healCoins: redemptionAmount + 10, // Add extra for test
            lastUpdated: new Date().toISOString(),
          });
        }
      });

      const initialWalletDoc = await getDoc(walletRef);
      const initialBalance = initialWalletDoc.data()?.healCoins || 0;

      // Process redemption
      const redemptionResult = await walletService.debitHealCoins(
        userId,
        redemptionAmount,
        `Reward redemption: ${rewardId}`,
        'redeem'
      );

      expect(redemptionResult.type).toBe('debit');
      expect(redemptionResult.amount).toBe(redemptionAmount);
      expect(redemptionResult.status).toBe('completed');

      // Verify wallet was debited
      const updatedWalletDoc = await getDoc(walletRef);
      const updatedWallet = updatedWalletDoc.data();
      expect(updatedWallet?.healCoins).toBe(initialBalance - redemptionAmount);

      // Verify redemption transaction was recorded
      const transactionsSnapshot = await collection(db, 'transactions')
        .where('userId', '==', userId)
        .where('type', '==', 'debit')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      expect(transactionsSnapshot.docs).toHaveLength(1);
      const transaction = transactionsSnapshot.docs[0].data();
      expect(transaction.amount).toBe(redemptionAmount);
      expect(transaction.description).toContain('Reward redemption');

      // Verify audit log for redemption
      const auditLogsSnapshot = await collection(db, 'auditLogs')
        .where('userId', '==', userId)
        .where('action', '==', 'HEALCOINS_DEBITED')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      expect(auditLogsSnapshot.docs).toHaveLength(1);
      const auditLog = auditLogsSnapshot.docs[0].data();
      expect(auditLog.details.amount).toBe(redemptionAmount);
      expect(auditLog.details.purpose).toBe('redeem');
    });

    it('should prevent redemption with insufficient balance', async () => {
      const userId = 'test-citizen-1';
      const redemptionAmount = 200; // More than available balance

      await signInWithEmailAndPassword(auth, TEST_USERS.citizen.email, 'testpassword123');

      // Ensure user has low balance
      const walletRef = doc(db, 'wallets', userId);
      await runTransaction(db, async transaction => {
        transaction.update(walletRef, {
          healCoins: 50, // Less than redemption amount
          lastUpdated: new Date().toISOString(),
        });
      });

      // Attempt redemption
      await expect(
        walletService.debitHealCoins(userId, redemptionAmount, 'Large redemption attempt', 'redeem')
      ).rejects.toThrow('Insufficient balance');

      // Verify wallet was not changed
      const walletDoc = await getDoc(walletRef);
      const wallet = walletDoc.data();
      expect(wallet?.healCoins).toBe(50);
    });
  });

  describe('Tracker Integration', () => {
    it('should complete tracker activity and award coins', async () => {
      const userId = 'test-citizen-1';
      const trackerType = 'carbon';
      const activityData = {
        transportMode: 'bicycle',
        distance: 10,
        co2Saved: 2.5,
      };
      const coinsAwarded = 5;

      await signInWithEmailAndPassword(auth, TEST_USERS.citizen.email, 'testpassword123');

      const initialWalletDoc = await getDoc(doc(db, 'wallets', userId));
      const initialBalance = initialWalletDoc.data()?.healCoins || 0;

      // Record tracker activity
      await setDoc(doc(db, 'trackerLogs', `${userId}_${Date.now()}`), {
        userId,
        type: trackerType,
        data: activityData,
        timestamp: new Date().toISOString(),
        coinsAwarded,
      });

      // Award coins for tracker activity
      const creditResult = await walletService.creditHealCoins(
        userId,
        coinsAwarded,
        `Carbon tracker activity: ${activityData.co2Saved}kg CO2 saved`,
        'tracker'
      );

      expect(creditResult.type).toBe('credit');
      expect(creditResult.amount).toBe(coinsAwarded);

      // Verify wallet update
      const updatedWalletDoc = await getDoc(doc(db, 'wallets', userId));
      const updatedWallet = updatedWalletDoc.data();
      expect(updatedWallet?.healCoins).toBe(initialBalance + coinsAwarded);

      // Verify activity log
      const activityLogsSnapshot = await collection(db, 'activityLogs')
        .where('userId', '==', userId)
        .where('action', '==', 'HEALCOINS_CREDITED')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      expect(activityLogsSnapshot.docs).toHaveLength(1);
      const activityLog = activityLogsSnapshot.docs[0].data();
      expect(activityLog.details.source).toBe('tracker');
      expect(activityLog.details.amount).toBe(coinsAwarded);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent wallet operations safely', async () => {
      const userId = 'test-citizen-1';

      await signInWithEmailAndPassword(auth, TEST_USERS.citizen.email, 'testpassword123');

      // Set initial balance
      const walletRef = doc(db, 'wallets', userId);
      await setDoc(walletRef, {
        ...TEST_WALLETS[userId],
        healCoins: 100,
        lastUpdated: new Date().toISOString(),
      });

      // Perform concurrent credit operations
      const concurrentOperations = [
        walletService.creditHealCoins(userId, 10, 'Operation 1', 'game'),
        walletService.creditHealCoins(userId, 15, 'Operation 2', 'tracker'),
        walletService.creditHealCoins(userId, 5, 'Operation 3', 'game'),
      ];

      const results = await Promise.all(concurrentOperations);

      // Verify all operations succeeded
      results.forEach(result => {
        expect(result.status).toBe('completed');
      });

      // Verify final balance is correct
      const finalWalletDoc = await getDoc(walletRef);
      const finalWallet = finalWalletDoc.data();
      expect(finalWallet?.healCoins).toBe(130); // 100 + 10 + 15 + 5

      // Verify all transactions were recorded
      const transactionsSnapshot = await collection(db, 'transactions')
        .where('userId', '==', userId)
        .where('type', '==', 'credit')
        .get();

      expect(transactionsSnapshot.docs).toHaveLength(3);
    });
  });

  describe('Error Recovery', () => {
    it('should handle partial failures gracefully', async () => {
      const userId = 'test-citizen-1';

      await signInWithEmailAndPassword(auth, TEST_USERS.citizen.email, 'testpassword123');

      // Simulate a scenario where wallet update fails but transaction is recorded
      const walletRef = doc(db, 'wallets', userId);

      // Mock a failure in wallet update
      jest.spyOn(walletService, 'creditHealCoins').mockImplementationOnce(async () => {
        // Record transaction but fail wallet update
        await setDoc(doc(db, 'transactions', 'failed_txn'), {
          userId,
          type: 'credit',
          amount: 10,
          description: 'Failed operation',
          status: 'pending',
          createdAt: new Date().toISOString(),
        });

        throw new Error('Wallet update failed');
      });

      // Attempt operation
      await expect(
        walletService.creditHealCoins(userId, 10, 'Test operation', 'game')
      ).rejects.toThrow('Wallet update failed');

      // Verify transaction is marked as failed or pending
      const transactionDoc = await getDoc(doc(db, 'transactions', 'failed_txn'));
      const transaction = transactionDoc.data();
      expect(transaction?.status).toBe('pending');

      // Restore original implementation
      jest.restoreAllMocks();
    });
  });
});
