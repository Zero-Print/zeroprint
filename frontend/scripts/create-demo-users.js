#!/usr/bin/env node

/**
 * Demo user creation script for ZeroPrint
 * Run this to create demo users in your Firebase project
 * 
 * Usage: node scripts/create-demo-users.js
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

// Load environment variables (assuming this runs from frontend directory)
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const demoUsers = [
  { email: 'vikash11@gmail.com', password: '123456', role: 'citizen' },
  { email: 'admin@zeroprint.com', password: 'admin123', role: 'admin' },
  { email: 'govt@zeroprint.com', password: 'govt123', role: 'govt' },
];

async function createDemoUsers() {
  console.log('🚀 Creating demo users for ZeroPrint...\n');

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  for (const user of demoUsers) {
    try {
      console.log(`Creating user: ${user.email}...`);
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      console.log(`✅ Successfully created: ${user.email} (${userCredential.user.uid})`);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️  User already exists: ${user.email}`);
      } else {
        console.error(`❌ Failed to create ${user.email}:`, error.message);
      }
    }
  }

  console.log('\n🎉 Demo user creation completed!');
  console.log('You can now use these credentials to login:');
  demoUsers.forEach(user => {
    console.log(`  ${user.role}: ${user.email} / ${user.password}`);
  });

  process.exit(0);
}

createDemoUsers().catch(console.error);
