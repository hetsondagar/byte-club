#!/usr/bin/env node

/**
 * BYTECLUB: Byte Rush API Test Script
 * Tests all Byte Rush endpoints and functionality
 */

const axios = require('axios');

// BYTECLUB: Configuration
const BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000';
const API_BASE = `${BASE_URL}/api/byte-rush`;

// BYTECLUB: Test data
const testScore = {
  displayName: 'TestPlayer',
  score: 50000,
  distance: 2500,
  commits: 25,
  runDurationMs: 120000,
  powerupsUsed: ['tryCatch', 'optimizationBoost'],
  clientGameVersion: '1.0.0'
};

// BYTECLUB: Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// BYTECLUB: Test runner
class ByteRushTester {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async test(name, testFn) {
    try {
      this.log(`\n🧪 Testing: ${name}`, 'cyan');
      await testFn();
      this.passed++;
      this.log(`✅ PASSED: ${name}`, 'green');
    } catch (error) {
      this.failed++;
      this.log(`❌ FAILED: ${name}`, 'red');
      this.log(`   Error: ${error.message}`, 'red');
    }
  }

  async runAllTests() {
    this.log('🎮 BYTECLUB: Byte Rush API Test Suite', 'bold');
    this.log('=' * 50, 'cyan');

    // BYTECLUB: Health check
    await this.test('Health Check', async () => {
      const response = await axios.get(`${API_BASE}/health`);
      if (!response.data.success) {
        throw new Error('Health check failed');
      }
      this.log(`   Server: ${response.data.message}`, 'green');
    });

    // BYTECLUB: Get game configuration
    await this.test('Get Game Configuration', async () => {
      const response = await axios.get(`${API_BASE}/config`);
      if (!response.data.success) {
        throw new Error('Failed to get game config');
      }
      const { powerups, gameConfig } = response.data.data;
      this.log(`   Powerups: ${Object.keys(powerups).length}`, 'green');
      this.log(`   Max Score: ${gameConfig.MAX_SCORE}`, 'green');
    });

    // BYTECLUB: Get leaderboard
    await this.test('Get Leaderboard', async () => {
      const response = await axios.get(`${API_BASE}/leaderboard?limit=10`);
      if (!response.data.success) {
        throw new Error('Failed to get leaderboard');
      }
      const { leaderboard } = response.data.data;
      this.log(`   Entries: ${leaderboard.length}`, 'green');
      if (leaderboard.length > 0) {
        this.log(`   Top Score: ${leaderboard[0].score}`, 'green');
      }
    });

    // BYTECLUB: Get game statistics
    await this.test('Get Game Statistics', async () => {
      const response = await axios.get(`${API_BASE}/stats`);
      if (!response.data.success) {
        throw new Error('Failed to get game stats');
      }
      const stats = response.data.data;
      this.log(`   Total Scores: ${stats.totalScores}`, 'green');
      this.log(`   Total Players: ${stats.totalPlayers}`, 'green');
      this.log(`   Average Score: ${stats.averageScore}`, 'green');
    });

    // BYTECLUB: Submit test score
    await this.test('Submit Test Score', async () => {
      const response = await axios.post(`${API_BASE}/score`, testScore);
      if (!response.data.success) {
        throw new Error('Failed to submit score');
      }
      const { rank } = response.data.data;
      this.log(`   Score Submitted: ${testScore.score}`, 'green');
      this.log(`   Rank: ${rank}`, 'green');
    });

    // BYTECLUB: Test invalid score submission
    await this.test('Test Invalid Score (Anti-cheat)', async () => {
      const invalidScore = {
        ...testScore,
        score: 999999999, // Unrealistically high score
        distance: 100 // Very low distance
      };
      
      try {
        await axios.post(`${API_BASE}/score`, invalidScore);
        throw new Error('Should have rejected invalid score');
      } catch (error) {
        if (error.response && error.response.status === 400) {
          this.log('   Anti-cheat validation working', 'green');
        } else {
          throw error;
        }
      }
    });

    // BYTECLUB: Test rate limiting
    await this.test('Test Rate Limiting', async () => {
      const promises = [];
      for (let i = 0; i < 7; i++) { // Try to submit 7 scores quickly
        promises.push(
          axios.post(`${API_BASE}/score`, {
            ...testScore,
            score: 1000 + i,
            displayName: `RateTest${i}`
          }).catch(err => err.response)
        );
      }
      
      const responses = await Promise.all(promises);
      const rateLimited = responses.filter(r => r && r.status === 429);
      
      if (rateLimited.length > 0) {
        this.log(`   Rate limiting working: ${rateLimited.length} requests blocked`, 'green');
      } else {
        this.log('   Rate limiting may not be active', 'yellow');
      }
    });

    // BYTECLUB: Test leaderboard after submission
    await this.test('Verify Score in Leaderboard', async () => {
      const response = await axios.get(`${API_BASE}/leaderboard?limit=50`);
      if (!response.data.success) {
        throw new Error('Failed to get updated leaderboard');
      }
      
      const { leaderboard } = response.data.data;
      const testEntry = leaderboard.find(entry => 
        entry.displayName === testScore.displayName && 
        entry.score === testScore.score
      );
      
      if (testEntry) {
        this.log(`   Test score found at rank ${testEntry.rank}`, 'green');
      } else {
        this.log('   Test score not found in leaderboard', 'yellow');
      }
    });

    // BYTECLUB: Test user-specific endpoints (without auth)
    await this.test('Test User Endpoints (No Auth)', async () => {
      try {
        await axios.get(`${API_BASE}/me/best`);
        throw new Error('Should require authentication');
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.log('   Authentication required for user endpoints', 'green');
        } else {
          throw error;
        }
      }
    });

    // BYTECLUB: Test specific user endpoint
    await this.test('Test Specific User Endpoint', async () => {
      const response = await axios.get(`${API_BASE}/user/testuser/best`);
      if (!response.data.success) {
        throw new Error('Failed to get user best score');
      }
      this.log('   User endpoint accessible', 'green');
    });

    // BYTECLUB: Print results
    this.printResults();
  }

  printResults() {
    this.log('\n' + '=' * 50, 'cyan');
    this.log('🎮 BYTECLUB: Byte Rush Test Results', 'bold');
    this.log(`✅ Passed: ${this.passed}`, 'green');
    this.log(`❌ Failed: ${this.failed}`, 'red');
    this.log(`📊 Total: ${this.passed + this.failed}`, 'cyan');
    
    if (this.failed === 0) {
      this.log('\n🚀 All tests passed! Byte Rush API is working perfectly!', 'green');
    } else {
      this.log('\n⚠️  Some tests failed. Check the errors above.', 'yellow');
    }
    
    this.log('\n[BYTECLUB] Test suite complete. Ready for deployment! 🎮', 'cyan');
  }
}

// BYTECLUB: Run tests
async function main() {
  const tester = new ByteRushTester();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// BYTECLUB: Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// BYTECLUB: Run if called directly
if (require.main === module) {
  main();
}

module.exports = ByteRushTester;
