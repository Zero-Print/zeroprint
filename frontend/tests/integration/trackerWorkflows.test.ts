import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  doc,
  getDoc,
  setDoc,
  clearFirestoreData,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  runTransaction,
  Timestamp,
} from 'firebase/firestore';
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';
import { TEST_USERS, TEST_TRACKER_LOGS } from '../fixtures/seed-data';

// Firebase emulator configuration
const firebaseConfig = {
  projectId: 'zeroprint-test',
  apiKey: 'test-api-key',
  authDomain: 'zeroprint-test.firebaseapp.com',
  storageBucket: 'zeroprint-test.appspot.com',
  messagingSenderId: '123456789',
  appId: 'test-app-id',
};

describe('Tracker Workflows Integration Tests', () => {
  let app: any;
  let db: any;
  let auth: any;
  let functions: any;

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

    // Initialize wallets
    for (const userId of Object.keys(TEST_USERS)) {
      batch.push(
        setDoc(doc(db, 'wallets', userId), {
          healCoins: 50,
          totalEarned: 50,
          totalSpent: 0,
          lastUpdated: new Date().toISOString(),
          limits: {
            daily: { max: 100, used: 0, resetAt: new Date().toISOString() },
            monthly: { max: 1000, used: 0, resetAt: new Date().toISOString() },
          },
        })
      );
    }

    await Promise.all(batch);
  };

  describe('Carbon Tracker Workflow', () => {
    it('should complete carbon tracking activity and award coins', async () => {
      const userId = 'test-citizen-1';
      const carbonData = {
        transportMode: 'bicycle',
        distance: 15, // km
        duration: 45, // minutes
        co2Saved: 3.2, // kg
        date: new Date().toISOString(),
      };

      await signInWithEmailAndPassword(auth, TEST_USERS[userId].email, 'testpassword123');

      // Get initial wallet balance
      const initialWalletDoc = await getDoc(doc(db, 'wallets', userId));
      const initialBalance = initialWalletDoc.data()?.healCoins || 0;

      // Submit carbon tracker data
      const submitCarbonData = httpsCallable(functions, 'submitCarbonTrackerData');

      const result = await submitCarbonData({
        userId,
        data: carbonData,
      });

      expect(result.data).toEqual({
        success: true,
        coinsAwarded: 5, // Expected coins for 3.2kg CO2 saved
        co2Saved: 3.2,
        ecoScore: expect.any(Number),
      });

      // Verify tracker log was created
      const trackerLogsQuery = query(
        collection(db, 'trackerLogs'),
        where('userId', '==', userId),
        where('type', '==', 'carbon'),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      const trackerLogsSnapshot = await getDocs(trackerLogsQuery);

      expect(trackerLogsSnapshot.docs).toHaveLength(1);
      const trackerLog = trackerLogsSnapshot.docs[0].data();

      expect(trackerLog.data.transportMode).toBe('bicycle');
      expect(trackerLog.data.distance).toBe(15);
      expect(trackerLog.data.co2Saved).toBe(3.2);
      expect(trackerLog.coinsAwarded).toBe(5);

      // Verify wallet was updated
      const updatedWalletDoc = await getDoc(doc(db, 'wallets', userId));
      const updatedWallet = updatedWalletDoc.data();
      expect(updatedWallet?.healCoins).toBe(initialBalance + 5);

      // Verify eco action log was created
      const ecoActionLogsQuery = query(
        collection(db, 'ecoActionLogs'),
        where('userId', '==', userId),
        where('actionType', '==', 'transport'),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      const ecoActionLogsSnapshot = await getDocs(ecoActionLogsQuery);

      expect(ecoActionLogsSnapshot.docs).toHaveLength(1);
      const ecoActionLog = ecoActionLogsSnapshot.docs[0].data();

      expect(ecoActionLog.impact.co2Saved).toBe(3.2);
      expect(ecoActionLog.impact.points).toBe(5);

      // Verify eco score was updated
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      expect(userData?.ecoScore).toBeGreaterThan(0);

      // Verify audit log
      const auditLogsQuery = query(
        collection(db, 'auditLogs'),
        where('userId', '==', userId),
        where('action', '==', 'CARBON_TRACKER_SUBMITTED'),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      const auditLogsSnapshot = await getDocs(auditLogsQuery);

      expect(auditLogsSnapshot.docs).toHaveLength(1);
      const auditLog = auditLogsSnapshot.docs[0].data();

      expect(auditLog.details.co2Saved).toBe(3.2);
      expect(auditLog.details.coinsAwarded).toBe(5);
    });

    it('should calculate weekly carbon footprint trends', async () => {
      const userId = 'test-citizen-1';

      await signInWithEmailAndPassword(auth, TEST_USERS[userId].email, 'testpassword123');

      // Submit multiple carbon tracking entries over a week
      const carbonEntries = [
        {
          transportMode: 'bicycle',
          distance: 10,
          co2Saved: 2.1,
          date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        },
        {
          transportMode: 'walking',
          distance: 5,
          co2Saved: 1.0,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          transportMode: 'public_transport',
          distance: 20,
          co2Saved: 4.5,
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
        {
          transportMode: 'bicycle',
          distance: 15,
          co2Saved: 3.2,
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          transportMode: 'walking',
          distance: 8,
          co2Saved: 1.6,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          transportMode: 'bicycle',
          distance: 12,
          co2Saved: 2.5,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        { transportMode: 'public_transport', distance: 25, co2Saved: 5.6, date: new Date() },
      ];

      const submitCarbonData = httpsCallable(functions, 'submitCarbonTrackerData');

      for (const entry of carbonEntries) {
        await submitCarbonData({
          userId,
          data: {
            ...entry,
            duration: 30,
            date: entry.date.toISOString(),
          },
        });
      }

      // Calculate weekly trends
      const calculateTrends = httpsCallable(functions, 'calculateCarbonTrends');

      const trendsResult = await calculateTrends({
        userId,
        period: 'week',
      });

      expect(trendsResult.data).toEqual({
        success: true,
        trends: {
          totalCo2Saved: 20.5, // Sum of all co2Saved values
          averageDailyCo2Saved: expect.any(Number),
          mostUsedTransportMode: 'bicycle',
          totalDistance: 95,
          totalCoinsEarned: expect.any(Number),
          weeklyGoalProgress: expect.any(Number),
          comparison: {
            previousWeek: expect.any(Number),
            percentageChange: expect.any(Number),
          },
        },
      });

      // Verify weekly summary was stored
      const weeklySummaryDoc = await getDoc(
        doc(
          db,
          'carbonSummaries',
          `${userId}_week_${new Date().getFullYear()}_${Math.ceil(new Date().getDate() / 7)}`
        )
      );
      const weeklySummary = weeklySummaryDoc.data();

      expect(weeklySummary?.totalCo2Saved).toBe(20.5);
      expect(weeklySummary?.entriesCount).toBe(7);
      expect(weeklySummary?.averageDailyCo2Saved).toBeGreaterThan(0);
    });

    it('should handle invalid carbon tracker data', async () => {
      const userId = 'test-citizen-1';
      const invalidData = {
        transportMode: 'invalid_mode',
        distance: -5, // Negative distance
        co2Saved: 'invalid', // Non-numeric value
        date: 'invalid_date',
      };

      await signInWithEmailAndPassword(auth, TEST_USERS[userId].email, 'testpassword123');

      const submitCarbonData = httpsCallable(functions, 'submitCarbonTrackerData');

      await expect(
        submitCarbonData({
          userId,
          data: invalidData,
        })
      ).rejects.toThrow('Invalid tracker data');

      // Verify no tracker log was created
      const trackerLogsQuery = query(
        collection(db, 'trackerLogs'),
        where('userId', '==', userId),
        where('type', '==', 'carbon')
      );
      const trackerLogsSnapshot = await getDocs(trackerLogsQuery);

      expect(trackerLogsSnapshot.docs).toHaveLength(0);
    });
  });

  describe('Mental Health Tracker Workflow', () => {
    it('should record mood rating and calculate weekly trends', async () => {
      const userId = 'test-citizen-1';
      const moodData = {
        rating: 8, // 1-10 scale
        activities: ['meditation', 'exercise', 'social_interaction'],
        notes: 'Feeling great after morning workout',
        sleepHours: 7.5,
        stressLevel: 3, // 1-10 scale
        date: new Date().toISOString(),
      };

      await signInWithEmailAndPassword(auth, TEST_USERS[userId].email, 'testpassword123');

      // Submit mental health data
      const submitMentalHealthData = httpsCallable(functions, 'submitMentalHealthData');

      const result = await submitMentalHealthData({
        userId,
        data: moodData,
      });

      expect(result.data).toEqual({
        success: true,
        coinsAwarded: 3, // Coins for positive mental health tracking
        wellnessScore: expect.any(Number),
      });

      // Verify mood log was created
      const moodLogsQuery = query(
        collection(db, 'moodLogs'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      const moodLogsSnapshot = await getDocs(moodLogsQuery);

      expect(moodLogsSnapshot.docs).toHaveLength(1);
      const moodLog = moodLogsSnapshot.docs[0].data();

      expect(moodLog.rating).toBe(8);
      expect(moodLog.activities).toEqual(['meditation', 'exercise', 'social_interaction']);
      expect(moodLog.sleepHours).toBe(7.5);
      expect(moodLog.stressLevel).toBe(3);

      // Verify wellness score was updated
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      expect(userData?.wellnessScore).toBeGreaterThan(0);

      // Submit multiple entries for trend calculation
      const moodEntries = [
        {
          rating: 7,
          stressLevel: 4,
          sleepHours: 6.5,
          activities: ['reading'],
          date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        },
        {
          rating: 6,
          stressLevel: 6,
          sleepHours: 5.5,
          activities: ['work'],
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          rating: 8,
          stressLevel: 3,
          sleepHours: 8.0,
          activities: ['meditation', 'exercise'],
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
        {
          rating: 9,
          stressLevel: 2,
          sleepHours: 8.5,
          activities: ['social_interaction', 'nature'],
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      ];

      for (const entry of moodEntries) {
        await submitMentalHealthData({
          userId,
          data: {
            ...entry,
            notes: 'Daily mood tracking',
            date: entry.date.toISOString(),
          },
        });
      }

      // Calculate weekly mental health trends
      const calculateMentalHealthTrends = httpsCallable(functions, 'calculateMentalHealthTrends');

      const trendsResult = await calculateMentalHealthTrends({
        userId,
        period: 'week',
      });

      expect(trendsResult.data).toEqual({
        success: true,
        trends: {
          averageMoodRating: expect.any(Number),
          averageStressLevel: expect.any(Number),
          averageSleepHours: expect.any(Number),
          mostFrequentActivities: expect.any(Array),
          moodTrend: expect.stringMatching(/improving|stable|declining/),
          wellnessScore: expect.any(Number),
          recommendations: expect.any(Array),
        },
      });

      // Verify weekly mental health summary
      const weeklyMentalHealthDoc = await getDoc(
        doc(
          db,
          'mentalHealthSummaries',
          `${userId}_week_${new Date().getFullYear()}_${Math.ceil(new Date().getDate() / 7)}`
        )
      );
      const weeklyMentalHealth = weeklyMentalHealthDoc.data();

      expect(weeklyMentalHealth?.averageMoodRating).toBeGreaterThan(0);
      expect(weeklyMentalHealth?.entriesCount).toBeGreaterThan(0);
    });

    it('should provide personalized mental health recommendations', async () => {
      const userId = 'test-citizen-1';

      await signInWithEmailAndPassword(auth, TEST_USERS[userId].email, 'testpassword123');

      // Submit mood data indicating stress
      const stressedMoodData = {
        rating: 4,
        stressLevel: 8,
        sleepHours: 5.0,
        activities: ['work', 'screen_time'],
        notes: 'Feeling overwhelmed with work',
        date: new Date().toISOString(),
      };

      const submitMentalHealthData = httpsCallable(functions, 'submitMentalHealthData');

      await submitMentalHealthData({
        userId,
        data: stressedMoodData,
      });

      // Get personalized recommendations
      const getRecommendations = httpsCallable(functions, 'getMentalHealthRecommendations');

      const recommendationsResult = await getRecommendations({
        userId,
      });

      expect(recommendationsResult.data).toEqual({
        success: true,
        recommendations: expect.arrayContaining([
          expect.objectContaining({
            type: expect.stringMatching(/stress_management|sleep_improvement|mindfulness/),
            title: expect.any(String),
            description: expect.any(String),
            actionItems: expect.any(Array),
          }),
        ]),
        urgencyLevel: expect.stringMatching(/low|medium|high/),
      });

      // Verify recommendations were stored
      const recommendationsDoc = await getDoc(doc(db, 'mentalHealthRecommendations', userId));
      const recommendations = recommendationsDoc.data();

      expect(recommendations?.lastUpdated).toBeDefined();
      expect(recommendations?.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('Animal Welfare Tracker Workflow', () => {
    it('should record kindness actions and award coins', async () => {
      const userId = 'test-citizen-1';
      const kindnessData = {
        actionType: 'feeding_stray_animals',
        animalType: 'dogs',
        location: 'local_park',
        duration: 30, // minutes
        animalsHelped: 5,
        description: 'Fed stray dogs in the local park',
        photos: ['photo1.jpg', 'photo2.jpg'],
        date: new Date().toISOString(),
      };

      await signInWithEmailAndPassword(auth, TEST_USERS[userId].email, 'testpassword123');

      // Get initial wallet balance
      const initialWalletDoc = await getDoc(doc(db, 'wallets', userId));
      const initialBalance = initialWalletDoc.data()?.healCoins || 0;

      // Submit animal welfare data
      const submitAnimalWelfareData = httpsCallable(functions, 'submitAnimalWelfareData');

      const result = await submitAnimalWelfareData({
        userId,
        data: kindnessData,
      });

      expect(result.data).toEqual({
        success: true,
        coinsAwarded: 10, // Coins for animal welfare action
        kindnessScore: expect.any(Number),
        impact: {
          animalsHelped: 5,
          category: 'feeding',
          points: 10,
        },
      });

      // Verify kindness log was created
      const kindnessLogsQuery = query(
        collection(db, 'kindnessLogs'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      const kindnessLogsSnapshot = await getDocs(kindnessLogsQuery);

      expect(kindnessLogsSnapshot.docs).toHaveLength(1);
      const kindnessLog = kindnessLogsSnapshot.docs[0].data();

      expect(kindnessLog.actionType).toBe('feeding_stray_animals');
      expect(kindnessLog.animalType).toBe('dogs');
      expect(kindnessLog.animalsHelped).toBe(5);
      expect(kindnessLog.coinsAwarded).toBe(10);

      // Verify wallet was updated
      const updatedWalletDoc = await getDoc(doc(db, 'wallets', userId));
      const updatedWallet = updatedWalletDoc.data();
      expect(updatedWallet?.healCoins).toBe(initialBalance + 10);

      // Verify kindness score was updated
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      expect(userData?.kindnessScore).toBeGreaterThan(0);

      // Verify audit log
      const auditLogsQuery = query(
        collection(db, 'auditLogs'),
        where('userId', '==', userId),
        where('action', '==', 'KINDNESS_ACTION_LOGGED'),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      const auditLogsSnapshot = await getDocs(auditLogsQuery);

      expect(auditLogsSnapshot.docs).toHaveLength(1);
      const auditLog = auditLogsSnapshot.docs[0].data();

      expect(auditLog.details.actionType).toBe('feeding_stray_animals');
      expect(auditLog.details.coinsAwarded).toBe(10);
    });

    it('should track animal welfare impact over time', async () => {
      const userId = 'test-citizen-1';

      await signInWithEmailAndPassword(auth, TEST_USERS[userId].email, 'testpassword123');

      // Submit multiple animal welfare actions
      const animalWelfareActions = [
        {
          actionType: 'feeding_stray_animals',
          animalType: 'cats',
          animalsHelped: 3,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          actionType: 'veterinary_care',
          animalType: 'dogs',
          animalsHelped: 1,
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
        {
          actionType: 'shelter_volunteering',
          animalType: 'mixed',
          animalsHelped: 15,
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          actionType: 'rescue_operation',
          animalType: 'birds',
          animalsHelped: 2,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          actionType: 'feeding_stray_animals',
          animalType: 'dogs',
          animalsHelped: 7,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ];

      const submitAnimalWelfareData = httpsCallable(functions, 'submitAnimalWelfareData');

      for (const action of animalWelfareActions) {
        await submitAnimalWelfareData({
          userId,
          data: {
            ...action,
            location: 'various_locations',
            duration: 60,
            description: `${action.actionType} for ${action.animalType}`,
            date: action.date.toISOString(),
          },
        });
      }

      // Calculate animal welfare impact
      const calculateAnimalWelfareImpact = httpsCallable(functions, 'calculateAnimalWelfareImpact');

      const impactResult = await calculateAnimalWelfareImpact({
        userId,
        period: 'month',
      });

      expect(impactResult.data).toEqual({
        success: true,
        impact: {
          totalAnimalsHelped: 28, // Sum of all animalsHelped
          actionsByType: expect.any(Object),
          animalsByType: expect.any(Object),
          totalCoinsEarned: expect.any(Number),
          kindnessScore: expect.any(Number),
          achievements: expect.any(Array),
          nextMilestone: expect.any(Object),
        },
      });

      // Verify monthly animal welfare summary
      const monthlyAnimalWelfareDoc = await getDoc(
        doc(
          db,
          'animalWelfareSummaries',
          `${userId}_month_${new Date().getFullYear()}_${new Date().getMonth() + 1}`
        )
      );
      const monthlyAnimalWelfare = monthlyAnimalWelfareDoc.data();

      expect(monthlyAnimalWelfare?.totalAnimalsHelped).toBe(28);
      expect(monthlyAnimalWelfare?.actionsCount).toBe(5);
    });
  });

  describe('Digital Twin Simulation Workflow', () => {
    it('should save simulation results and persist data', async () => {
      const userId = 'test-citizen-1';
      const simulationData = {
        simulationType: 'carbon_footprint_projection',
        parameters: {
          currentCo2: 120, // kg per month
          targetReduction: 30, // percentage
          timeframe: 12, // months
          interventions: ['bicycle_commute', 'renewable_energy', 'waste_reduction'],
        },
        results: {
          projectedCo2Reduction: 36, // kg per month
          costSavings: 2400, // rupees per year
          healthBenefits: {
            exerciseHours: 48, // per month
            airQualityImprovement: 15, // percentage
          },
          environmentalImpact: {
            treesEquivalent: 1.2,
            waterSaved: 500, // liters per month
          },
        },
        date: new Date().toISOString(),
      };

      await signInWithEmailAndPassword(auth, TEST_USERS[userId].email, 'testpassword123');

      // Save simulation results
      const saveSimulationResults = httpsCallable(functions, 'saveSimulationResults');

      const result = await saveSimulationResults({
        userId,
        data: simulationData,
      });

      expect(result.data).toEqual({
        success: true,
        simulationId: expect.any(String),
        coinsAwarded: 5, // Coins for completing simulation
        insights: expect.any(Array),
      });

      // Verify simulation was saved
      const simulationsQuery = query(
        collection(db, 'digitalTwinSimulations'),
        where('userId', '==', userId),
        where('simulationType', '==', 'carbon_footprint_projection'),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      const simulationsSnapshot = await getDocs(simulationsQuery);

      expect(simulationsSnapshot.docs).toHaveLength(1);
      const simulation = simulationsSnapshot.docs[0].data();

      expect(simulation.parameters.targetReduction).toBe(30);
      expect(simulation.results.projectedCo2Reduction).toBe(36);
      expect(simulation.results.costSavings).toBe(2400);

      // Verify user's digital twin profile was updated
      const digitalTwinDoc = await getDoc(doc(db, 'digitalTwins', userId));
      const digitalTwin = digitalTwinDoc.data();

      expect(digitalTwin?.lastSimulation).toBeDefined();
      expect(digitalTwin?.simulationsCount).toBeGreaterThan(0);
      expect(digitalTwin?.carbonFootprintModel).toBeDefined();
    });

    it('should generate personalized recommendations from simulation', async () => {
      const userId = 'test-citizen-1';

      await signInWithEmailAndPassword(auth, TEST_USERS[userId].email, 'testpassword123');

      // Get personalized recommendations based on digital twin
      const getDigitalTwinRecommendations = httpsCallable(
        functions,
        'getDigitalTwinRecommendations'
      );

      const recommendationsResult = await getDigitalTwinRecommendations({
        userId,
        focus: 'carbon_reduction',
      });

      expect(recommendationsResult.data).toEqual({
        success: true,
        recommendations: expect.arrayContaining([
          expect.objectContaining({
            category: expect.stringMatching(/transport|energy|waste|lifestyle/),
            action: expect.any(String),
            impact: expect.any(Object),
            difficulty: expect.stringMatching(/easy|medium|hard/),
            timeframe: expect.any(String),
          }),
        ]),
        priorityActions: expect.any(Array),
        projectedImpact: expect.any(Object),
      });
    });
  });

  describe('MSME ESG Reporting Workflow', () => {
    it('should generate and store monthly ESG report', async () => {
      const userId = 'test-msme-1';
      const esgData = {
        environmental: {
          energyConsumption: 1200, // kWh
          renewableEnergyPercentage: 25,
          wasteGenerated: 150, // kg
          wasteRecycled: 120, // kg
          waterConsumption: 5000, // liters
          carbonEmissions: 800, // kg CO2
        },
        social: {
          employeeCount: 25,
          femaleEmployeePercentage: 40,
          trainingHours: 200,
          safetyIncidents: 0,
          communityInvestment: 50000, // rupees
        },
        governance: {
          boardMeetings: 4,
          auditCompliance: 95, // percentage
          ethicsTraining: true,
          dataPrivacyCompliance: true,
          supplierAssessments: 12,
        },
        reportingPeriod: {
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
      };

      await signInWithEmailAndPassword(auth, TEST_USERS[userId].email, 'testpassword123');

      // Generate ESG report
      const generateESGReport = httpsCallable(functions, 'generateESGReport');

      const result = await generateESGReport({
        userId,
        data: esgData,
      });

      expect(result.data).toEqual({
        success: true,
        reportId: expect.any(String),
        esgScore: expect.any(Number),
        recommendations: expect.any(Array),
        benchmarks: expect.any(Object),
      });

      // Verify ESG report was stored
      const esgReportsQuery = query(
        collection(db, 'esgReports'),
        where('userId', '==', userId),
        where('reportingPeriod.year', '==', new Date().getFullYear()),
        where('reportingPeriod.month', '==', new Date().getMonth() + 1),
        limit(1)
      );
      const esgReportsSnapshot = await getDocs(esgReportsQuery);

      expect(esgReportsSnapshot.docs).toHaveLength(1);
      const esgReport = esgReportsSnapshot.docs[0].data();

      expect(esgReport.environmental.energyConsumption).toBe(1200);
      expect(esgReport.social.employeeCount).toBe(25);
      expect(esgReport.governance.boardMeetings).toBe(4);
      expect(esgReport.esgScore).toBeGreaterThan(0);

      // Verify ESG metrics were updated in user profile
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      expect(userData?.esgScore).toBeGreaterThan(0);
      expect(userData?.lastESGReport).toBeDefined();

      // Verify audit log for ESG report generation
      const auditLogsQuery = query(
        collection(db, 'auditLogs'),
        where('userId', '==', userId),
        where('action', '==', 'ESG_REPORT_GENERATED'),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      const auditLogsSnapshot = await getDocs(auditLogsQuery);

      expect(auditLogsSnapshot.docs).toHaveLength(1);
      const auditLog = auditLogsSnapshot.docs[0].data();

      expect(auditLog.details.reportId).toBeDefined();
      expect(auditLog.details.esgScore).toBeGreaterThan(0);
    });

    it('should compare ESG performance with industry benchmarks', async () => {
      const userId = 'test-msme-1';

      await signInWithEmailAndPassword(auth, TEST_USERS[userId].email, 'testpassword123');

      // Get ESG benchmarks comparison
      const getESGBenchmarks = httpsCallable(functions, 'getESGBenchmarks');

      const benchmarksResult = await getESGBenchmarks({
        userId,
        industry: 'manufacturing',
        companySize: 'small',
      });

      expect(benchmarksResult.data).toEqual({
        success: true,
        benchmarks: {
          environmental: expect.any(Object),
          social: expect.any(Object),
          governance: expect.any(Object),
        },
        userPerformance: expect.any(Object),
        ranking: expect.any(Object),
        improvementAreas: expect.any(Array),
      });
    });
  });

  describe('Cross-Tracker Integration', () => {
    it('should calculate comprehensive sustainability score across all trackers', async () => {
      const userId = 'test-citizen-1';

      await signInWithEmailAndPassword(auth, TEST_USERS[userId].email, 'testpassword123');

      // Submit data across multiple trackers
      const submitCarbonData = httpsCallable(functions, 'submitCarbonTrackerData');
      const submitMentalHealthData = httpsCallable(functions, 'submitMentalHealthData');
      const submitAnimalWelfareData = httpsCallable(functions, 'submitAnimalWelfareData');

      // Carbon tracking
      await submitCarbonData({
        userId,
        data: {
          transportMode: 'bicycle',
          distance: 20,
          co2Saved: 4.2,
          date: new Date().toISOString(),
        },
      });

      // Mental health tracking
      await submitMentalHealthData({
        userId,
        data: {
          rating: 8,
          stressLevel: 3,
          sleepHours: 8,
          activities: ['meditation', 'exercise'],
          date: new Date().toISOString(),
        },
      });

      // Animal welfare tracking
      await submitAnimalWelfareData({
        userId,
        data: {
          actionType: 'feeding_stray_animals',
          animalType: 'dogs',
          animalsHelped: 5,
          date: new Date().toISOString(),
        },
      });

      // Calculate comprehensive sustainability score
      const calculateSustainabilityScore = httpsCallable(functions, 'calculateSustainabilityScore');

      const scoreResult = await calculateSustainabilityScore({
        userId,
      });

      expect(scoreResult.data).toEqual({
        success: true,
        sustainabilityScore: expect.any(Number),
        breakdown: {
          ecoScore: expect.any(Number),
          wellnessScore: expect.any(Number),
          kindnessScore: expect.any(Number),
          digitalTwinScore: expect.any(Number),
        },
        achievements: expect.any(Array),
        nextGoals: expect.any(Array),
        totalCoinsEarned: expect.any(Number),
      });

      // Verify comprehensive score was stored
      const sustainabilityScoreDoc = await getDoc(doc(db, 'sustainabilityScores', userId));
      const sustainabilityScore = sustainabilityScoreDoc.data();

      expect(sustainabilityScore?.overallScore).toBeGreaterThan(0);
      expect(sustainabilityScore?.lastUpdated).toBeDefined();
      expect(sustainabilityScore?.breakdown).toBeDefined();
    });
  });
});
