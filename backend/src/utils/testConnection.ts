import mongoose from 'mongoose';
import { config } from '../config';
import logger from '../config/logger';

export const testConnection = async (): Promise<boolean> => {
  try {
    const mongoUri = config.mongoUri;
    if (!mongoUri) {
      logger.error('MONGO_URI environment variable is not set');
      return false;
    }

    const connectionString = mongoUri.endsWith('/') 
      ? `${mongoUri}byte_club` 
      : `${mongoUri}/byte_club`;

    await mongoose.connect(connectionString);
    
    // Test basic operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    logger.info('Database connection test successful');
    logger.info(`Connected to database: ${db.databaseName}`);
    logger.info(`Collections found: ${collections.length}`);
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    logger.error('Database connection test failed:', error);
    return false;
  }
};
