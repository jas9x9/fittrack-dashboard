import { db } from '../server/storage/database';
import { exercises, goals, workoutProgress } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function checkData() {
  console.log('=== CHECKING DATABASE DATA ===\n');

  // Get all exercises
  const allExercises = await db.select().from(exercises);
  console.log('Exercises:');
  allExercises.forEach(ex => {
    console.log(`  - ${ex.name} (ID: ${ex.id})`);
  });

  // Get all goals
  const allGoals = await db.select().from(goals);
  console.log('\nGoals:');
  allGoals.forEach(goal => {
    console.log(`  - Goal for exercise ID: ${goal.exerciseId}`);
  });

  // Get all workout progress
  const allProgress = await db.select().from(workoutProgress);
  console.log('\nWorkout Progress:');
  allProgress.forEach(progress => {
    console.log(`  - Progress for exercise ID: ${progress.exerciseId}, value: ${progress.value}`);
  });

  // Check for "Running" specifically
  const runningExercises = allExercises.filter(ex => ex.name.toLowerCase() === 'running');
  console.log('\n=== RUNNING EXERCISE(S) ===');
  if (runningExercises.length === 0) {
    console.log('No "Running" exercise found');
  } else {
    for (const running of runningExercises) {
      console.log(`\nRunning exercise: ${running.id}`);

      const runningGoals = await db.select().from(goals).where(eq(goals.exerciseId, running.id));
      console.log(`  Goals: ${runningGoals.length}`);

      const runningProgress = await db.select().from(workoutProgress).where(eq(workoutProgress.exerciseId, running.id));
      console.log(`  Progress entries: ${runningProgress.length}`);
      runningProgress.forEach(p => {
        console.log(`    - Value: ${p.value}, Date: ${p.progressDate}`);
      });
    }
  }

  // Check for orphaned records
  const orphanedGoals = await db.execute(`
    SELECT * FROM goals
    WHERE exercise_id NOT IN (SELECT id FROM exercises)
  `);
  console.log('\n=== ORPHANED RECORDS ===');
  console.log(`Orphaned goals: ${orphanedGoals.rowCount}`);

  const orphanedProgress = await db.execute(`
    SELECT * FROM "workoutProgress"
    WHERE exercise_id NOT IN (SELECT id FROM exercises)
  `);
  console.log(`Orphaned progress: ${orphanedProgress.rowCount}`);

  if (orphanedProgress.rowCount && orphanedProgress.rowCount > 0) {
    console.log('\nOrphaned progress entries:');
    (orphanedProgress.rows as any[]).forEach(row => {
      console.log(`  - Exercise ID: ${row.exercise_id}, Value: ${row.value}, Date: ${row.progress_date}`);
    });
  }

  process.exit(0);
}

checkData().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
