const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAuthentication() {
  console.log('🧪 Testing Byte Club Authentication System\n');

  try {
    // Test 1: Public endpoint (should work)
    console.log('1️⃣ Testing public endpoint...');
    const publicResponse = await axios.get(`${BASE_URL}/test-auth`);
    console.log('✅ Public endpoint works:', publicResponse.data.message);

    // Test 2: Protected endpoint without token (should fail)
    console.log('\n2️⃣ Testing protected endpoint without token...');
    try {
      await axios.get(`${BASE_URL}/api/auth/test-protected`);
      console.log('❌ ERROR: Protected endpoint should have failed!');
    } catch (error) {
      console.log('✅ Protected endpoint correctly blocked:', error.response.data.message);
    }

    // Test 3: Signup
    console.log('\n3️⃣ Testing user signup...');
    const signupData = {
      username: 'testuser123',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const signupResponse = await axios.post(`${BASE_URL}/api/auth/signup`, signupData);
    console.log('✅ Signup successful:', signupResponse.data.message);
    console.log('👤 User created:', signupResponse.data.data.user.username);
    
    const { accessToken } = signupResponse.data.data;

    // Test 4: Protected endpoint with token (should work)
    console.log('\n4️⃣ Testing protected endpoint with token...');
    const protectedResponse = await axios.get(`${BASE_URL}/api/auth/test-protected`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    console.log('✅ Protected endpoint works:', protectedResponse.data.message);
    console.log('👤 Authenticated user:', protectedResponse.data.user);

    // Test 5: Get user data
    console.log('\n5️⃣ Testing get user data...');
    const userResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    console.log('✅ User data retrieved:', userResponse.data.data.user.username);

    console.log('\n🎉 All authentication tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAuthentication();
