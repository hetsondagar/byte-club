import { ByteRushScore, POWERUP_DEFINITIONS } from '../models/ByteRush';
import logger from '../config/logger';

// BYTECLUB: Demo data for Byte Rush leaderboard
const DEMO_SCORES = [
  {
    displayName: 'NeonHacker',
    score: 125000,
    distance: 8500,
    commits: 45,
    runDurationMs: 120000,
    powerupsUsed: ['tryCatch', 'optimizationBoost', 'debuggerDrone'],
    clientGameVersion: '1.0.0'
  },
  {
    displayName: 'CodeNinja',
    score: 118000,
    distance: 7800,
    commits: 38,
    runDurationMs: 115000,
    powerupsUsed: ['garbageCollector', 'hotfix'],
    clientGameVersion: '1.0.0'
  },
  {
    displayName: 'ByteMaster',
    score: 112000,
    distance: 7200,
    commits: 42,
    runDurationMs: 108000,
    powerupsUsed: ['tryCatch', 'optimizationBoost'],
    clientGameVersion: '1.0.0'
  },
  {
    displayName: 'CyberRunner',
    score: 105000,
    distance: 6800,
    commits: 35,
    runDurationMs: 102000,
    powerupsUsed: ['debuggerDrone', 'garbageCollector'],
    clientGameVersion: '1.0.0'
  },
  {
    displayName: 'TerminalWarrior',
    score: 98000,
    distance: 6200,
    commits: 32,
    runDurationMs: 95000,
    powerupsUsed: ['tryCatch', 'hotfix'],
    clientGameVersion: '1.0.0'
  },
  {
    displayName: 'GlitchHunter',
    score: 92000,
    distance: 5800,
    commits: 28,
    runDurationMs: 88000,
    powerupsUsed: ['optimizationBoost'],
    clientGameVersion: '1.0.0'
  },
  {
    displayName: 'MatrixRunner',
    score: 87000,
    distance: 5400,
    commits: 25,
    runDurationMs: 82000,
    powerupsUsed: ['garbageCollector', 'debuggerDrone'],
    clientGameVersion: '1.0.0'
  },
  {
    displayName: 'BinaryBeast',
    score: 82000,
    distance: 5000,
    commits: 22,
    runDurationMs: 78000,
    powerupsUsed: ['tryCatch'],
    clientGameVersion: '1.0.0'
  },
  {
    displayName: 'SyntaxSprint',
    score: 78000,
    distance: 4600,
    commits: 20,
    runDurationMs: 74000,
    powerupsUsed: ['hotfix', 'optimizationBoost'],
    clientGameVersion: '1.0.0'
  },
  {
    displayName: 'DebugDynamo',
    score: 73000,
    distance: 4200,
    commits: 18,
    runDurationMs: 70000,
    powerupsUsed: ['debuggerDrone'],
    clientGameVersion: '1.0.0'
  },
  {
    displayName: 'Anonymous',
    score: 68000,
    distance: 3800,
    commits: 15,
    runDurationMs: 65000,
    powerupsUsed: ['garbageCollector'],
    clientGameVersion: '1.0.0'
  },
  {
    displayName: 'Anonymous',
    score: 62000,
    distance: 3400,
    commits: 12,
    runDurationMs: 60000,
    powerupsUsed: ['tryCatch'],
    clientGameVersion: '1.0.0'
  },
  {
    displayName: 'Anonymous',
    score: 55000,
    distance: 3000,
    commits: 10,
    runDurationMs: 55000,
    powerupsUsed: [],
    clientGameVersion: '1.0.0'
  },
  {
    displayName: 'Anonymous',
    score: 48000,
    distance: 2600,
    commits: 8,
    runDurationMs: 50000,
    powerupsUsed: ['hotfix'],
    clientGameVersion: '1.0.0'
  },
  {
    displayName: 'Anonymous',
    score: 42000,
    distance: 2200,
    commits: 6,
    runDurationMs: 45000,
    powerupsUsed: [],
    clientGameVersion: '1.0.0'
  }
];

// BYTECLUB: Seed Byte Rush leaderboard with demo data
export const seedByteRushData = async (): Promise<void> => {
  try {
    logger.info('🌱 Starting Byte Rush data seeding...');

    // Check if data already exists
    const existingScores = await ByteRushScore.countDocuments();
    if (existingScores > 0) {
      logger.info(`📊 Byte Rush data already exists (${existingScores} scores). Skipping seed.`);
      return;
    }

    // Create demo scores
    const scoresToCreate = DEMO_SCORES.map((scoreData, index) => ({
      ...scoreData,
      createdAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)) // Spread over last 15 days
    }));

    await ByteRushScore.insertMany(scoresToCreate);

    logger.info(`✅ Successfully seeded ${scoresToCreate.length} Byte Rush demo scores`);
    
    // Log some statistics
    const totalScores = await ByteRushScore.countDocuments();
    const averageScore = await ByteRushScore.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$score' } } }
    ]).then(result => result[0]?.avgScore || 0);

    logger.info(`📊 Byte Rush Statistics:`);
    logger.info(`   - Total scores: ${totalScores}`);
    logger.info(`   - Average score: ${Math.round(averageScore)}`);
    logger.info(`   - Powerups available: ${Object.keys(POWERUP_DEFINITIONS).length}`);

  } catch (error) {
    logger.error('❌ Error seeding Byte Rush data:', error);
    throw error;
  }
};

// BYTECLUB: Clear Byte Rush data (for testing)
export const clearByteRushData = async (): Promise<void> => {
  try {
    logger.info('🗑️ Clearing Byte Rush data...');
    
    const deletedCount = await ByteRushScore.deleteMany({});
    logger.info(`✅ Deleted ${deletedCount.deletedCount} Byte Rush scores`);
    
  } catch (error) {
    logger.error('❌ Error clearing Byte Rush data:', error);
    throw error;
  }
};

// BYTECLUB: Reset Byte Rush data (clear and reseed)
export const resetByteRushData = async (): Promise<void> => {
  try {
    logger.info('🔄 Resetting Byte Rush data...');
    
    await clearByteRushData();
    await seedByteRushData();
    
    logger.info('✅ Byte Rush data reset completed');
    
  } catch (error) {
    logger.error('❌ Error resetting Byte Rush data:', error);
    throw error;
  }
};
