#!/usr/bin/env node

/**
 * Script to sync a Clerk user with the backend database
 * Usage: node sync-clerk-user.js
 */

const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000';
const CLERK_SECRET_KEY = 'sk_test_z1yz3LAc4dQglp0oCUWxscpuKWqh8mnCsYHT5hYjxB';

// User details to sync
const USER_TO_SYNC = {
  clerkId: 'YOUR_CLERK_USER_ID', // Replace with actual Clerk User ID
  email: 'your.email@example.com', // Replace with your email
  firstName: 'Your', // Replace with your first name
  lastName: 'Name', // Replace with your last name
  role: 'ADMIN' // Can be ADMIN, STAFF, or CUSTOMER
};

async function syncUser() {
  try {
    console.log('🔄 Attempting to sync user...');
    
    // First, get a JWT token from Clerk (simulated here)
    // In production, you'd get this from Clerk's API
    
    const response = await axios.post(
      `${API_URL}/api/auth/sync`,
      {
        clerkId: USER_TO_SYNC.clerkId,
        email: USER_TO_SYNC.email,
        firstName: USER_TO_SYNC.firstName,
        lastName: USER_TO_SYNC.lastName,
        role: USER_TO_SYNC.role
      },
      {
        headers: {
          'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ User synced successfully:', response.data);
  } catch (error) {
    console.error('❌ Error syncing user:', error.response?.data || error.message);
    
    // If sync endpoint doesn't exist, try direct database insert
    console.log('\n💡 Alternative: Add user directly to database using Prisma Studio:');
    console.log('1. Run: yarn db:studio');
    console.log('2. Open User table');
    console.log('3. Add new record with:');
    console.log(`   - clerkId: ${USER_TO_SYNC.clerkId}`);
    console.log(`   - email: ${USER_TO_SYNC.email}`);
    console.log(`   - firstName: ${USER_TO_SYNC.firstName}`);
    console.log(`   - lastName: ${USER_TO_SYNC.lastName}`);
    console.log(`   - roleId: (select the appropriate role ID for ${USER_TO_SYNC.role})`);
  }
}

// Instructions for getting Clerk User ID
console.log('📝 How to get your Clerk User ID:');
console.log('1. Sign in to your app with Clerk');
console.log('2. Open browser console (F12)');
console.log('3. The Login component logs the Clerk user info');
console.log('4. Or visit https://dashboard.clerk.com and find your user\n');

syncUser();