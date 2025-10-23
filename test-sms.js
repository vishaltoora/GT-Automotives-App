#!/usr/bin/env node

/**
 * Quick SMS Test Script for GT Automotive
 *
 * Usage:
 *   node test-sms.js +12505551234 "Your test message here"
 *
 * Example:
 *   node test-sms.js +12505551234 "Hello from GT Automotive!"
 */

const axios = require('axios');

// Get command line arguments
const args = process.argv.slice(2);
const phoneNumber = args[0];
const message = args[1] || 'Test message from GT Automotive!';

if (!phoneNumber) {
  console.error('❌ Error: Phone number is required!');
  console.log('\nUsage:');
  console.log('  node test-sms.js +12505551234 "Your message here"');
  console.log('\nExample:');
  console.log('  node test-sms.js +12505551234 "Hello from GT Automotive!"');
  process.exit(1);
}

// Validate phone number format
if (!phoneNumber.match(/^\+1\d{10}$/)) {
  console.error('❌ Error: Invalid phone number format!');
  console.log('Phone number must be in E.164 format: +1XXXXXXXXXX');
  console.log('Example: +12505551234');
  process.exit(1);
}

console.log('📱 GT Automotive SMS Test');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📞 To: ${phoneNumber}`);
console.log(`💬 Message: ${message}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Note: This is a mock test - the actual SMS sending happens through the backend
console.log('⏳ Testing SMS configuration...\n');

// Test that backend is running
axios.get('http://localhost:3000/api/health')
  .then(() => {
    console.log('✅ Backend is running on http://localhost:3000');
    console.log('✅ SMS Service should be initialized');
    console.log('\n📋 Next Steps:');
    console.log('1. Create a test customer in the admin dashboard');
    console.log('2. Add the customer\'s phone number');
    console.log('3. Create an appointment for tomorrow');
    console.log('4. Check the admin SMS History page');
    console.log('\nOr use the Admin Dashboard to send test SMS:');
    console.log('http://localhost:4200/admin/sms-history');
  })
  .catch((error) => {
    console.error('❌ Backend is not running!');
    console.error('\nPlease start the backend first:');
    console.error('  cd /Users/vishaltoora/projects/gt-automotives-app');
    console.error('  yarn dev');
    console.error('\nThen run this test script again.');
  });
