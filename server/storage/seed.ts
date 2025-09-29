import 'dotenv/config';
import { db } from './database';
import { exercises, goals, workoutProgress } from '../../shared/schema.js';

async function seedData() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data (be careful in production!)
    await db.delete(workoutProgress);
    await db.delete(goals);
    await db.delete(exercises);
    console.log('✅ Cleared existing data');

    // Insert exercises
    const insertedExercises = await db.insert(exercises).values([
      { name: 'Bench Press' },
      { name: 'Squats' },
      { name: 'Running' },
      { name: 'Push-ups' },
      { name: 'Deadlift' }
    ]).returning();
    console.log('✅ Inserted exercises:', insertedExercises.map(e => e.name));

    // Insert sample goals
    const today = new Date();
    const targetDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days from now

    const sampleGoals = [
      {
        exerciseId: insertedExercises[0].id, // Bench Press
        currentValue: 140,
        targetValue: 150,
        targetDate
      },
      {
        exerciseId: insertedExercises[1].id, // Squats
        currentValue: 200,
        targetValue: 220,
        targetDate
      },
      {
        exerciseId: insertedExercises[2].id, // Running
        currentValue: 4.2,
        targetValue: 5.0,
        targetDate
      }
    ];

    const insertedGoals = await db.insert(goals).values(sampleGoals).returning();
    console.log('✅ Inserted goals:', insertedGoals.length);

    // Insert sample workout progress
    const progressEntries = [
      {
        exerciseId: insertedExercises[0].id, // Bench Press
        value: 135,
        progressDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        notes: 'Good form, felt strong'
      },
      {
        exerciseId: insertedExercises[0].id, // Bench Press
        value: 140,
        progressDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        exerciseId: insertedExercises[2].id, // Running
        value: 3.8,
        progressDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        notes: 'Morning run, felt good'
      },
      {
        exerciseId: insertedExercises[2].id, // Running
        value: 4.2,
        progressDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), // Yesterday
      }
    ];

    const insertedProgress = await db.insert(workoutProgress).values(progressEntries).returning();
    console.log('✅ Inserted workout progress entries:', insertedProgress.length);

    console.log('🎉 Database seeding completed successfully!');

    // Force exit to prevent hanging
    setTimeout(() => {
      process.exit(0);
    }, 100);

  } catch (error) {
    console.error('❌ Seeding failed:', error);

    setTimeout(() => {
      process.exit(1);
    }, 100);
  }
}

// Run the seeding - simplified check
seedData();