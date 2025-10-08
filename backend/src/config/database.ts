import mongoose from 'mongoose';
import logger from './logger';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    // Add database name to connection string
    const connectionString = mongoUri.endsWith('/') 
      ? `${mongoUri}byte_club` 
      : `${mongoUri}/byte_club`;

    await mongoose.connect(connectionString, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info('MongoDB Atlas connected successfully');
    logger.info(`Database: byte_club`);
    logger.info(`Connection state: ${mongoose.connection.readyState}`);
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
