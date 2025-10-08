const logger = require('./src/config/logger');

console.log('🧪 Testing Logger Configuration\n');

// Test different log levels
logger.info('✅ Info message - should be white');
logger.warn('⚠️  Warning message - should be yellow');
logger.error('❌ Error message - should be red');

// Test schema validation logging
logger.info('📋 Schema validation:', {
  schema: {
    type: 'object',
    properties: {
      username: { type: 'string', minLength: 3 },
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 }
    },
    required: ['username', 'email', 'password']
  },
  body: {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  }
});

console.log('\n📊 Logger should show:');
console.log('- White text for info messages');
console.log('- Yellow text for warnings');
console.log('- Red text for errors');
console.log('- No "INFO:" prefix');
console.log('- Clean schema validation details');
