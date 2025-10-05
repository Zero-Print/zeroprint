#!/usr/bin/env node

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  doc,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { ALL_TEST_DATA, convertToFirestoreTimestamp } from '../tests/fixtures/seed-data';

// Firebase config for emulator
const firebaseConfig = {
  apiKey: 'test-api-key',
  authDomain: 'test-project.firebaseapp.com',
  projectId: 'test-project',
  storageBucket: 'test-project.appspot.com',
  messagingSenderId: '123456789',
  appId: 'test-app-id',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Connect to emulators
if (process.env.NODE_ENV !== 'production') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('🔗 Connected to Firebase Emulators');
  } catch (error) {
    console.log('⚠️ Emulators already connected or not available');
  }
}

async function seedAuthUsers() {
  console.log('👥 Seeding Auth users...');

  const users = Object.values(ALL_TEST_DATA.users);

  for (const user of users) {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        user.email,
        'testpassword123'
      );

      console.log(`✅ Created auth user: ${user.email}`);

      // Sign out after creating each user
      await signOut(auth);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️ User already exists: ${user.email}`);
      } else {
        console.error(`❌ Error creating user ${user.email}:`, error.message);
      }
    }
  }
}

async function seedFirestoreData() {
  console.log('📊 Seeding Firestore data...');

  const batch = writeBatch(db);
  let operationCount = 0;

  // Helper function to add to batch with limit check
  const addToBatch = (docRef: any, data: any) => {
    if (operationCount >= 500) {
      throw new Error('Batch size limit reached. Consider splitting into multiple batches.');
    }
    batch.set(docRef, convertToFirestoreTimestamp(data));
    operationCount++;
  };

  try {
    // Seed users
    console.log('  📝 Adding users...');
    Object.values(ALL_TEST_DATA.users).forEach(user => {
      const userRef = doc(db, 'users', user.id);
      addToBatch(userRef, user);
    });

    // Seed wallets
    console.log('  💰 Adding wallets...');
    Object.values(ALL_TEST_DATA.wallets).forEach(wallet => {
      const walletRef = doc(db, 'wallets', wallet.id);
      addToBatch(walletRef, wallet);
    });

    // Seed games
    console.log('  🎮 Adding games...');
    ALL_TEST_DATA.games.forEach(game => {
      const gameRef = doc(db, 'games', game.id);
      addToBatch(gameRef, game);
    });

    // Seed questions
    console.log('  ❓ Adding questions...');
    ALL_TEST_DATA.questions.forEach(question => {
      const questionRef = doc(db, 'questions', question.id);
      addToBatch(questionRef, question);
    });

    // Seed rewards
    console.log('  🎁 Adding rewards...');
    ALL_TEST_DATA.rewards.forEach(reward => {
      const rewardRef = doc(db, 'rewards', reward.id);
      addToBatch(rewardRef, reward);
    });

    // Seed ward data
    console.log('  🏛️ Adding ward data...');
    const wardRef = doc(db, 'wards', ALL_TEST_DATA.ward.id);
    addToBatch(wardRef, ALL_TEST_DATA.ward);

    // Seed tracker data
    console.log('  📊 Adding tracker data...');

    // Carbon logs
    ALL_TEST_DATA.carbonLogs.forEach(log => {
      const logRef = doc(db, 'carbonLogs', log.id);
      addToBatch(logRef, log);
    });

    // Mood logs
    ALL_TEST_DATA.moodLogs.forEach(log => {
      const logRef = doc(db, 'moodLogs', log.id);
      addToBatch(logRef, log);
    });

    // Animal logs
    ALL_TEST_DATA.animalLogs.forEach(log => {
      const logRef = doc(db, 'animalLogs', log.id);
      addToBatch(logRef, log);
    });

    // Transport logs
    ALL_TEST_DATA.transportLogs.forEach(log => {
      const logRef = doc(db, 'transportLogs', log.id);
      addToBatch(logRef, log);
    });

    // ESG reports
    console.log('  📈 Adding ESG reports...');
    ALL_TEST_DATA.esgReports.forEach(report => {
      const reportRef = doc(db, 'esgReports', report.id);
      addToBatch(reportRef, report);
    });

    // Payments
    console.log('  💳 Adding payments...');
    ALL_TEST_DATA.payments.forEach(payment => {
      const paymentRef = doc(db, 'payments', payment.id);
      addToBatch(paymentRef, payment);
    });

    // Subscriptions
    console.log('  📋 Adding subscriptions...');
    ALL_TEST_DATA.subscriptions.forEach(subscription => {
      const subscriptionRef = doc(db, 'subscriptions', subscription.id);
      addToBatch(subscriptionRef, subscription);
    });

    // Audit logs
    console.log('  📋 Adding audit logs...');
    ALL_TEST_DATA.auditLogs.forEach(log => {
      const logRef = doc(db, 'auditLogs', log.id);
      addToBatch(logRef, log);
    });

    // Commit the batch
    console.log(`  💾 Committing ${operationCount} operations...`);
    await batch.commit();
    console.log('✅ Firestore data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding Firestore data:', error);
    throw error;
  }
}

async function clearExistingData() {
  console.log('🧹 Clearing existing test data...');

  const collections = [
    'users',
    'wallets',
    'games',
    'questions',
    'rewards',
    'wards',
    'carbonLogs',
    'moodLogs',
    'animalLogs',
    'transportLogs',
    'esgReports',
    'payments',
    'subscriptions',
    'auditLogs',
  ];

  // Note: In a real scenario, you might want to implement proper cleanup
  // For emulator testing, we can just overwrite the data
  console.log('⚠️ Overwriting existing data (emulator mode)');
}

async function main() {
  try {
    console.log('🌱 Starting test data seeding...');
    console.log('🔧 Environment:', process.env.NODE_ENV || 'development');

    // Check if we're running against emulator
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Cannot seed data in production environment!');
      process.exit(1);
    }

    await clearExistingData();
    await seedAuthUsers();
    await seedFirestoreData();

    console.log('🎉 Test data seeding completed successfully!');
    console.log('📊 Seeded data summary:');
    console.log(`  👥 Users: ${Object.keys(ALL_TEST_DATA.users).length}`);
    console.log(`  💰 Wallets: ${Object.keys(ALL_TEST_DATA.wallets).length}`);
    console.log(`  🎮 Games: ${ALL_TEST_DATA.games.length}`);
    console.log(`  ❓ Questions: ${ALL_TEST_DATA.questions.length}`);
    console.log(`  🎁 Rewards: ${ALL_TEST_DATA.rewards.length}`);
    console.log(`  📊 Carbon logs: ${ALL_TEST_DATA.carbonLogs.length}`);
    console.log(`  😊 Mood logs: ${ALL_TEST_DATA.moodLogs.length}`);
    console.log(`  🐾 Animal logs: ${ALL_TEST_DATA.animalLogs.length}`);
    console.log(`  🚗 Transport logs: ${ALL_TEST_DATA.transportLogs.length}`);
    console.log(`  📈 ESG reports: ${ALL_TEST_DATA.esgReports.length}`);
    console.log(`  💳 Payments: ${ALL_TEST_DATA.payments.length}`);
    console.log(`  📋 Subscriptions: ${ALL_TEST_DATA.subscriptions.length}`);
    console.log(`  📋 Audit logs: ${ALL_TEST_DATA.auditLogs.length}`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding script
if (require.main === module) {
  main();
}

export { main as seedTestData };
