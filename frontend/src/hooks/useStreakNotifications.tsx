import { useEffect } from 'react';
import { toast } from 'sonner';
import { checkStreakStatus } from '@/lib/streak';

export function useStreakNotifications() {
  useEffect(() => {
    // Check streak status when the app loads
    const checkStreak = () => {
      const { shouldBreak, hoursSinceLastActivity } = checkStreakStatus();
      
      if (shouldBreak && hoursSinceLastActivity > 0) {
        const days = Math.floor(hoursSinceLastActivity / 24);
        const hours = Math.floor(hoursSinceLastActivity % 24);
        
        let timeMessage = '';
        if (days > 0) {
          timeMessage = `${days} day${days > 1 ? 's' : ''}`;
          if (hours > 0) {
            timeMessage += ` and ${hours} hour${hours > 1 ? 's' : ''}`;
          }
        } else {
          timeMessage = `${hours} hour${hours > 1 ? 's' : ''}`;
        }
        
        toast.warning(
          `Your streak has been broken! You haven't solved anything for ${timeMessage}. Start a new streak today!`,
          {
            duration: 8000,
            action: {
              label: 'Start New Streak',
              onClick: () => {
                // This will be handled when they solve their next challenge
                toast.info('Solve a challenge to start your new streak!');
              }
            }
          }
        );
      }
    };

    // Check immediately
    checkStreak();
    
    // Also check periodically (every hour) to catch streak breaks
    const interval = setInterval(checkStreak, 60 * 60 * 1000); // 1 hour
    
    return () => clearInterval(interval);
  }, []);
}

