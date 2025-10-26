import mongoose from 'mongoose';
import { config } from '../config';
import { seedChallengesPageData } from './challengesPageData';
import { seed99Challenges } from '../scripts/seed99Challenges';
import { seedFrontendAchievements } from './frontendAchievements';

import { Migration } from '../models';
import logger from '../config/logger';

const runSeeds = async () => {
  const startTime = Date.now();
  
  try {
    logger.info('🌱 Starting database seeding process...');
    
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
    logger.info('✅ Connected to MongoDB for seeding');

    // Check if seeds have already been run
    logger.info('🔍 Checking for existing seed data...');
    // Seed 1: Frontend challenges (the 6 detailed ones) and achievements
    const pageDataSeed = await Migration.findOne({ name: 'challenges_page_data_seed_v2' });
    if (!pageDataSeed) {
      logger.info('🔄 Running initial seed: populating challenges and meta data...');

      // Run seeds with detailed logging
      logger.info('📚 Seeding challenges from frontend page data...');
      await seedChallengesPageData();
      logger.info('✅ Frontend challenges seeded successfully');

      logger.info('🏆 Seeding achievements from frontend static data...');
      await seedFrontendAchievements();
      logger.info('✅ Frontend achievements seeded successfully');

      // Record migration
      logger.info('📝 Recording seed completion for frontend page data...');
      const migration = new Migration({ name: 'challenges_page_data_seed_v2' });
      await migration.save();
      logger.info('  ✅ Seed record saved to migrations collection (frontend page data)');
    } else {
      logger.info('⏭️  Frontend page data seed already applied, skipping');
    }

    // Seed 2: 99 comprehensive DSA challenges
    const dsaSeed = await Migration.findOne({ name: 'dsa_99_challenges_seed_v1' });
    if (!dsaSeed) {
      logger.info('📚 Seeding comprehensive 99 DSA challenges...');
      const count = await seed99Challenges();
      logger.info(`✅ Seeded ${count} DSA challenges`);

      logger.info('📝 Recording seed completion for 99 DSA challenges...');
      const migration = new Migration({ name: 'dsa_99_challenges_seed_v1' });
      await migration.save();
      logger.info('  ✅ Seed record saved to migrations collection (99 DSA)');
    } else {
      logger.info('⏭️  99 DSA challenges seed already applied, skipping');
    }

    // Enrichment V3: Update 99 DSA to use question as description (no separate description field)
    const dsaEnrichV3 = await Migration.findOne({ name: 'dsa_99_challenges_enrich_v3' });
    if (!dsaEnrichV3) {
      logger.info('🧩 Updating 99 DSA challenges to use question as description...');
      const count = await seed99Challenges();
      logger.info(`✅ Updated ${count} DSA challenges`);
      const migration = new Migration({ name: 'dsa_99_challenges_enrich_v3' });
      await migration.save();
      logger.info('  ✅ Seed record saved to migrations collection (99 DSA Enrich V3)');
    } else {
      logger.info('⏭️  99 DSA enrichment v3 already applied, skipping');
    }



    const duration = Date.now() - startTime;
    logger.info(`🎉 Database seeding completed successfully in ${duration}ms`);
    logger.info('📊 Byte Club database is now populated with challenges and meta data');
    logger.info('🚀 Ready for user registration and challenge solving!');
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`❌ Seeding failed after ${duration}ms:`, {
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
  runSeeds()
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export default runSeeds;
