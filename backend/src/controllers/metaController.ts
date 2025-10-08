import { Request, Response } from 'express';
import { Meta } from '../models';
import logger from '../config/logger';

export const getMeta = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    
    if (!['badge', 'reward', 'quest'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meta type. Must be badge, reward, or quest'
      });
    }

    const metaItems = await Meta.find({ type }).sort({ name: 1 });

    res.json({
      success: true,
      message: 'Meta data retrieved successfully',
      data: { items: metaItems }
    });
  } catch (error) {
    logger.error('Get meta error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const seedMeta = async (req: any, res: Response) => {
  try {
    // This endpoint is for seeding meta data (admin only)
    // The actual seeding logic will be in the seed files
    
    res.json({
      success: true,
      message: 'Meta seeding endpoint - use seed script instead'
    });
  } catch (error) {
    logger.error('Seed meta error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
