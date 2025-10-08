const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testRequests() {
  console.log('🧪 Testing Server Request Logging\n');

  try {
    // Test 1: Simple ping
    console.log('1️⃣ Testing /ping endpoint...');
    const pingResponse = await axios.get(`${BASE_URL}/ping`);
    console.log('✅ Ping response:', pingResponse.data.message);

    // Test 2: Health check
    console.log('\n2️⃣ Testing /health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health response:', healthResponse.data.message);

    // Test 3: Test auth endpoint
    console.log('\n3️⃣ Testing /test-auth endpoint...');
    const authResponse = await axios.get(`${BASE_URL}/test-auth`);
    console.log('✅ Auth test response:', authResponse.data.message);

    // Test 4: API endpoint
    console.log('\n4️⃣ Testing /api/auth/signup endpoint...');
    try {
      const signupResponse = await axios.post(`${BASE_URL}/api/auth/signup`, {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('✅ Signup response:', signupResponse.data.message);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Signup validation working (user might already exist)');
      } else {
        console.log('❌ Signup error:', error.response?.data || error.message);
      }
    }

    console.log('\n🎉 All requests sent! Check your server logs for:');
    console.log('📥 GET /ping');
    console.log('📥 GET /health');
    console.log('📥 GET /test-auth');
    console.log('📥 POST /api/auth/signup');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRequests();
