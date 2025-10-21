import mongoose from 'mongoose';
import { User } from '../src/models';
import { calculateLevel } from '../src/utils/xp';

async function recalculateUserXP() {
  try {
    // Connect to database
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    
    const connectionString = mongoUri.endsWith('/') 
      ? `${mongoUri}byte_club` 
      : `${mongoUri}/byte_club`;
      
    await mongoose.connect(connectionString);
    console.log('Connected to database');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to recalculate`);

    let updatedCount = 0;
    
    for (const user of users) {
      const oldLevel = (user as any).currentLevel;
      const totalXP = (user as any).totalXP;
      const newLevel = calculateLevel(totalXP);
      
      console.log(`User ${(user as any).username}:`);
      console.log(`  Total XP: ${totalXP}`);
      console.log(`  Old Level: ${oldLevel}`);
      console.log(`  New Level: ${newLevel}`);
      
      if (oldLevel !== newLevel) {
        (user as any).currentLevel = newLevel;
        await user.save();
        console.log(`  ✅ Updated level: ${oldLevel} -> ${newLevel}`);
        updatedCount++;
      } else {
        console.log(`  ⏭️ Level already correct`);
      }
      console.log('');
    }

    console.log(`\n✅ Recalculation complete! Updated ${updatedCount} users.`);
    
  } catch (error) {
    console.error('Error recalculating user XP:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

recalculateUserXP();
