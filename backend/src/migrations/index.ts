import mongoose from 'mongoose';
import { config } from '../config';
import { Migration } from '../models';
import logger from '../config/logger';

const runMigrations = async () => {
  const startTime = Date.now();
  
  try {
    logger.info('🚀 Starting database migrations...');
    
    // Connect to database
    const mongoUri = config.mongoUri;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    const connectionString = mongoUri.endsWith('/') 
      ? `${mongoUri}byte_club` 
      : `${mongoUri}/byte_club`;

    logger.info(`📡 Connecting to MongoDB Atlas: ${connectionString.replace(/\/\/.*@/, '//***:***@')}`);
    await mongoose.connect(connectionString);
    logger.info('✅ Connected to MongoDB for migrations');

    // Check if migrations have already been run
    logger.info('🔍 Checking for existing migrations...');
    const existingMigration = await Migration.findOne({ name: 'initial_migration' });
    if (existingMigration) {
      logger.info(`⏭️  Migration 'initial_migration' already applied at ${(existingMigration as any).createdAt}`);
      logger.info('✅ Migrations check completed - no new migrations to run');
      return;
    }

    logger.info('🔄 Running initial migration: database schema setup and indexing...');

    // Create indexes for better performance
    const User = mongoose.model('User');
    const Challenge = mongoose.model('Challenge');
    const Attempt = mongoose.model('Attempt');
    const Session = mongoose.model('Session');
    const Meta = mongoose.model('Meta');

    logger.info('📊 Creating database indexes for optimal performance...');

    // User indexes (only non-unique ones)
    logger.info('👤 Creating User collection indexes...');
    await User.collection.createIndex({ totalXP: -1 });
    logger.info('  ✅ Created index: totalXP (descending)');
    await User.collection.createIndex({ currentLevel: -1 });
    logger.info('  ✅ Created index: currentLevel (descending)');

    // Challenge indexes (only non-unique ones)
    logger.info('🎯 Creating Challenge collection indexes...');
    await Challenge.collection.createIndex({ difficulty: 1 });
    logger.info('  ✅ Created index: difficulty');
    await Challenge.collection.createIndex({ type: 1 });
    logger.info('  ✅ Created index: type');
    await Challenge.collection.createIndex({ isDaily: 1, isActive: 1 });
    logger.info('  ✅ Created compound index: isDaily + isActive');
    await Challenge.collection.createIndex({ tags: 1 });
    logger.info('  ✅ Created index: tags');

    // Attempt indexes
    logger.info('📝 Creating Attempt collection indexes...');
    await Attempt.collection.createIndex({ userId: 1, challengeSlug: 1 });
    logger.info('  ✅ Created compound index: userId + challengeSlug');
    await Attempt.collection.createIndex({ userId: 1, createdAt: -1 });
    logger.info('  ✅ Created compound index: userId + createdAt (descending)');
    await Attempt.collection.createIndex({ challengeSlug: 1 });
    logger.info('  ✅ Created index: challengeSlug');
    await Attempt.collection.createIndex({ createdAt: -1 });
    logger.info('  ✅ Created index: createdAt (descending)');
    await Attempt.collection.createIndex({ isCorrect: 1 });
    logger.info('  ✅ Created index: isCorrect');

    // Session indexes (only non-unique ones)
    logger.info('🔐 Creating Session collection indexes...');
    await Session.collection.createIndex({ userId: 1 });
    logger.info('  ✅ Created index: userId');
    await Session.collection.createIndex({ tokenHash: 1 });
    logger.info('  ✅ Created index: tokenHash');

    // Meta indexes (only non-unique ones)
    logger.info('🏷️  Creating Meta collection indexes...');
    await Meta.collection.createIndex({ type: 1 });
    logger.info('  ✅ Created index: type');
    await Meta.collection.createIndex({ type: 1, key: 1 });
    logger.info('  ✅ Created compound index: type + key');

    // Record migration
    logger.info('📝 Recording migration completion...');
    const migration = new Migration({
      name: 'initial_migration'
    });
    await migration.save();
    logger.info('  ✅ Migration record saved to migrations collection');

    const duration = Date.now() - startTime;
    logger.info(`🎉 Migrations completed successfully in ${duration}ms`);
    logger.info('📊 Database schema and indexes are now optimized for Byte Club operations');
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`❌ Migration failed after ${duration}ms:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`
    });
    throw error;
  } finally {
    logger.info('🔌 Disconnecting from MongoDB...');
    await mongoose.disconnect();
    logger.info('✅ Disconnected from MongoDB');
  }
};

// Run if called directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migrations completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migrations failed:', error);
      process.exit(1);
    });
}

export default runMigrations;
