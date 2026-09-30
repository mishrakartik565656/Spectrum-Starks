import { CronJob } from 'bun';
import { db } from './db';
import { bins } from './db/schema';
import { broadcast } from './ws';

// Run every minute for simulation
export const binFillSimulationJob = new CronJob('* * * * *', async () => {
  console.log('Running bin fill simulation...');
  const allBins = await db.select().from(bins);
  
  let updated = false;
  for (const bin of allBins) {
    if (bin.currentFillPercent < 100) {
      const increment = Math.floor(Math.random() * 10) + 1; // 1 to 10%
      const newFill = Math.min(100, bin.currentFillPercent + increment);
      const isOverflowing = newFill >= 80;
      
      await db.update(bins)
        .set({ currentFillPercent: newFill, isOverflowing })
        .where({ id: bin.id });
        
      if (isOverflowing && !bin.isOverflowing) {
        broadcast({ type: 'bin_alert', binId: bin.id, fill: newFill });
      }
      updated = true;
    }
  }
  
  if (updated) {
    broadcast({ type: 'bins_updated' });
  }
});

// Auto-start in dev/prod
binFillSimulationJob.start();
