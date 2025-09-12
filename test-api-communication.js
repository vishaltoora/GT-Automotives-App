// Test script to verify frontend-backend communication
// Run this in the browser console at http://localhost:4200

async function testAPIConnection() {
  console.log('Testing API connection...');
  
  try {
    // Test 1: Basic connection (will return 401 without auth)
    const response1 = await fetch('http://localhost:3000/api/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    console.log('Backend Response Status:', response1.status);
    console.log('Backend Headers:', Object.fromEntries(response1.headers.entries()));
    
    if (response1.status === 401) {
      console.log('✅ Backend is reachable! (401 is expected without authentication)');
    }
    
    // Test 2: Check CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': response1.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Credentials': response1.headers.get('Access-Control-Allow-Credentials')
    };
    
    console.log('CORS Headers:', corsHeaders);
    
    if (corsHeaders['Access-Control-Allow-Origin']) {
      console.log('✅ CORS is properly configured!');
    } else {
      console.log('❌ CORS headers missing');
    }
    
    // Test 3: OPTIONS preflight
    const preflightResponse = await fetch('http://localhost:3000/api/users', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:4200',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('Preflight Response:', preflightResponse.status);
    
    return {
      backendReachable: response1.status === 401 || response1.status === 200,
      corsConfigured: !!corsHeaders['Access-Control-Allow-Origin'],
      preflightOk: preflightResponse.status === 204 || preflightResponse.status === 200
    };
    
  } catch (error) {
    console.error('❌ Connection Error:', error);
    return {
      backendReachable: false,
      corsConfigured: false,
      preflightOk: false,
      error: error.message
    };
  }
}

// Run the test
testAPIConnection().then(result => {
  console.log('\n=== API Communication Test Results ===');
  console.log('Backend Reachable:', result.backendReachable ? '✅ Yes' : '❌ No');
  console.log('CORS Configured:', result.corsConfigured ? '✅ Yes' : '❌ No');
  console.log('Preflight OK:', result.preflightOk ? '✅ Yes' : '❌ No');
  
  if (result.error) {
    console.log('Error:', result.error);
  }
  
  if (result.backendReachable && result.corsConfigured) {
    console.log('\n✅ Frontend-Backend communication is working properly!');
    console.log('The 401 Unauthorized is expected since we\'re not authenticated.');
    console.log('Once logged in via Clerk, API calls will work.');
  } else {
    console.log('\n❌ There are issues with the frontend-backend communication.');
  }
});