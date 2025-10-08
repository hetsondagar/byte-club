const logger = require('./src/config/logger');

console.log('🧪 Testing Logger Configuration\n');

logger.info('✅ Info log test');
logger.warn('⚠️  Warning log test');
logger.error('❌ Error log test');

console.log('\n📊 Logger should show colored output above');
console.log('If you see this message but no colored logs above, there might be a logger configuration issue.');
