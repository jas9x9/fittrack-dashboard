import { db } from '../server/storage/database';
import { exercises, goals, workoutProgress } from '../shared/schema';
import { sql } from 'drizzle-orm';

async function cleanupOrphanedRecords() {
  console.log('Starting cleanup of orphaned records...\n');

  // Find and delete orphaned goals (goals referencing non-existent exercises)
  const orphanedGoalsResult = await db.execute(sql`
    DELETE FROM goals
    WHERE exercise_id NOT IN (SELECT id FROM exercises)
    RETURNING *
  `);

  console.log(`Deleted ${orphanedGoalsResult.rowCount || 0} orphaned goal records`);

  // Find and delete orphaned workout progress (progress referencing non-existent exercises)
  const orphanedProgressResult = await db.execute(sql`
    DELETE FROM "workoutProgress"
    WHERE exercise_id NOT IN (SELECT id FROM exercises)
    RETURNING *
  `);

  console.log(`Deleted ${orphanedProgressResult.rowCount || 0} orphaned workout progress records`);

  console.log('\n✓ Cleanup complete!');
  process.exit(0);
}

cleanupOrphanedRecords().catch((error) => {
  console.error('Error during cleanup:', error);
  process.exit(1);
});
