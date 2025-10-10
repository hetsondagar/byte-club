import { db } from '../config/database';
import logger from '../config/logger';

export async function up(): Promise<void> {
  try {
    logger.info('Running migration: create_code_heist_tables');

    // Create code_heist_rooms table
    await db.query(`
      CREATE TABLE IF NOT EXISTS code_heist_rooms (
        _id SERIAL PRIMARY KEY,
        room_code VARCHAR(10) UNIQUE NOT NULL,
        room_name VARCHAR(255) NOT NULL,
        host_id VARCHAR(255) NOT NULL,
        max_players INTEGER DEFAULT 6,
        players JSONB DEFAULT '[]'::jsonb,
        current_player_index INTEGER DEFAULT 0,
        deck JSONB DEFAULT '[]'::jsonb,
        discard_pile JSONB DEFAULT '[]'::jsonb,
        game_state VARCHAR(50) DEFAULT 'waiting',
        turn_number INTEGER DEFAULT 0,
        winner VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    logger.info('✅ Created code_heist_rooms table');

    // Create code_heist_stats table
    await db.query(`
      CREATE TABLE IF NOT EXISTS code_heist_stats (
        _id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        total_games INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        master_algorithm_captures INTEGER DEFAULT 0,
        total_points INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    logger.info('✅ Created code_heist_stats table');

    // Create indexes for better query performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_code_heist_rooms_room_code 
      ON code_heist_rooms(room_code)
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_code_heist_rooms_game_state 
      ON code_heist_rooms(game_state)
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_code_heist_stats_user_id 
      ON code_heist_stats(user_id)
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_code_heist_stats_total_points 
      ON code_heist_stats(total_points DESC)
    `);

    logger.info('✅ Created indexes for code_heist tables');

    // Create function to auto-update updated_at timestamp
    await db.query(`
      CREATE OR REPLACE FUNCTION update_code_heist_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create triggers for auto-updating updated_at
    await db.query(`
      DROP TRIGGER IF EXISTS update_code_heist_rooms_updated_at ON code_heist_rooms;
      CREATE TRIGGER update_code_heist_rooms_updated_at
      BEFORE UPDATE ON code_heist_rooms
      FOR EACH ROW
      EXECUTE FUNCTION update_code_heist_updated_at();
    `);

    await db.query(`
      DROP TRIGGER IF EXISTS update_code_heist_stats_updated_at ON code_heist_stats;
      CREATE TRIGGER update_code_heist_stats_updated_at
      BEFORE UPDATE ON code_heist_stats
      FOR EACH ROW
      EXECUTE FUNCTION update_code_heist_updated_at();
    `);

    logger.info('✅ Created triggers for code_heist tables');
    logger.info('✅ Migration create_code_heist_tables completed successfully');
  } catch (error) {
    logger.error('❌ Migration create_code_heist_tables failed:', error);
    throw error;
  }
}

export async function down(): Promise<void> {
  try {
    logger.info('Rolling back migration: create_code_heist_tables');

    // Drop triggers
    await db.query('DROP TRIGGER IF EXISTS update_code_heist_rooms_updated_at ON code_heist_rooms');
    await db.query('DROP TRIGGER IF EXISTS update_code_heist_stats_updated_at ON code_heist_stats');
    
    // Drop function
    await db.query('DROP FUNCTION IF EXISTS update_code_heist_updated_at');

    // Drop tables
    await db.query('DROP TABLE IF EXISTS code_heist_stats CASCADE');
    await db.query('DROP TABLE IF EXISTS code_heist_rooms CASCADE');

    logger.info('✅ Rollback create_code_heist_tables completed successfully');
  } catch (error) {
    logger.error('❌ Rollback create_code_heist_tables failed:', error);
    throw error;
  }
}

