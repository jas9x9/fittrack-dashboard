import { db } from './storage/database';
import { exercises, goals, workoutProgress } from '@shared/schema';
import { asc } from 'drizzle-orm';
import type {
  Exercise,
  InsertExercise,
  Goal,
  InsertGoal,
  GoalWithExercise,
  WorkoutProgress,
  InsertWorkoutProgress,
  WorkoutProgressWithExercise
} from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

export interface IStorage {
  // Exercise methods
  getAllExercises(): Promise<Exercise[]>;
  getExercise(id: string): Promise<Exercise | undefined>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  updateExercise(id: string, exercise: Partial<InsertExercise>): Promise<Exercise | undefined>;
  deleteExercise(id: string): Promise<boolean>;

  // Goal methods
  getAllGoals(): Promise<GoalWithExercise[]>;
  getGoal(id: string): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: string): Promise<boolean>;

  // Workout Progress methods
  getAllWorkoutProgress(): Promise<WorkoutProgressWithExercise[]>;
  getWorkoutProgressByExercise(exerciseId: string): Promise<WorkoutProgress[]>;
  createWorkoutProgress(progress: InsertWorkoutProgress): Promise<WorkoutProgress>;
  updateWorkoutProgress(id: string, progress: Partial<InsertWorkoutProgress>): Promise<WorkoutProgress | undefined>;
  deleteWorkoutProgress(id: string): Promise<boolean>;

  // Analytics methods
  getRecentWorkoutProgress(limit?: number): Promise<WorkoutProgressWithExercise[]>;
}

export class DatabaseStorage implements IStorage {
  // Exercise methods
  async getAllExercises(): Promise<Exercise[]> {
    return await db.select().from(exercises);
  }

  async getExercise(id: string): Promise<Exercise | undefined> {
    const result = await db.select().from(exercises).where(eq(exercises.id, id));
    return result[0];
  }

  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const result = await db.insert(exercises).values(exercise).returning();
    return result[0];
  }

  async updateExercise(id: string, exercise: Partial<InsertExercise>): Promise<Exercise | undefined> {
    const result = await db.update(exercises).set(exercise).where(eq(exercises.id, id)).returning();
    return result[0];
  }

  async deleteExercise(id: string): Promise<boolean> {
    const result = await db.delete(exercises).where(eq(exercises.id, id));
    return result.rowCount > 0;
  }

  // Goal methods
  async getAllGoals(): Promise<GoalWithExercise[]> {
    const results = await db
      .select({
        id: goals.id,
        exerciseId: goals.exerciseId,
        startingValue: goals.startingValue,
        targetValue: goals.targetValue,
        targetDate: goals.targetDate,
        currentValue: goals.currentValue,
        unit: goals.unit,
        isActive: goals.isActive,
        createdAt: goals.createdAt,
        exercise: exercises
      })
      .from(goals)
      .innerJoin(exercises, eq(goals.exerciseId, exercises.id))
      .orderBy(asc(goals.createdAt));

    return results;
  }

  async getGoal(id: string): Promise<Goal | undefined> {
    const result = await db.select().from(goals).where(eq(goals.id, id));
    return result[0];
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const result = await db.insert(goals).values(goal).returning();
    return result[0];
  }

  async updateGoal(id: string, goal: Partial<InsertGoal>): Promise<Goal | undefined> {
    const result = await db.update(goals).set(goal).where(eq(goals.id, id)).returning();
    return result[0];
  }

  async deleteGoal(id: string): Promise<boolean> {
    const result = await db.delete(goals).where(eq(goals.id, id));
    return result.rowCount > 0;
  }

  // Workout Progress methods
  async getAllWorkoutProgress(): Promise<WorkoutProgressWithExercise[]> {
    return await db
      .select({
        id: workoutProgress.id,
        exerciseId: workoutProgress.exerciseId,
        value: workoutProgress.value,
        progressDate: workoutProgress.progressDate,
        notes: workoutProgress.notes,
        exercise: exercises
      })
      .from(workoutProgress)
      .innerJoin(exercises, eq(workoutProgress.exerciseId, exercises.id))
      .orderBy(desc(workoutProgress.progressDate));
  }

  async getWorkoutProgressByExercise(exerciseId: string): Promise<WorkoutProgress[]> {
    return await db
      .select()
      .from(workoutProgress)
      .where(eq(workoutProgress.exerciseId, exerciseId))
      .orderBy(desc(workoutProgress.progressDate));
  }

  async createWorkoutProgress(progress: InsertWorkoutProgress): Promise<WorkoutProgress> {
    const result = await db.insert(workoutProgress).values(progress).returning();

    // Auto-update the goal's current value (find the latest progress for this exercise)
    const latestProgress = await db
      .select()
      .from(workoutProgress)
      .where(eq(workoutProgress.exerciseId, progress.exerciseId))
      .orderBy(desc(workoutProgress.progressDate))
      .limit(1);

    if (latestProgress.length > 0) {
      await db
        .update(goals)
        .set({ currentValue: latestProgress[0].value })
        .where(eq(goals.exerciseId, progress.exerciseId));
    }

    return result[0];
  }

  async updateWorkoutProgress(id: string, progress: Partial<InsertWorkoutProgress>): Promise<WorkoutProgress | undefined> {
    const result = await db.update(workoutProgress).set(progress).where(eq(workoutProgress.id, id)).returning();
    return result[0];
  }

  async deleteWorkoutProgress(id: string): Promise<boolean> {
    const result = await db.delete(workoutProgress).where(eq(workoutProgress.id, id));
    return result.rowCount > 0;
  }

  // Analytics methods
  async getRecentWorkoutProgress(limit: number = 20): Promise<WorkoutProgressWithExercise[]> {
    return await db
      .select({
        id: workoutProgress.id,
        exerciseId: workoutProgress.exerciseId,
        value: workoutProgress.value,
        progressDate: workoutProgress.progressDate,
        notes: workoutProgress.notes,
        exercise: exercises
      })
      .from(workoutProgress)
      .innerJoin(exercises, eq(workoutProgress.exerciseId, exercises.id))
      .orderBy(desc(workoutProgress.progressDate))
      .limit(limit);
  }
}

// Create and export the storage instance
export const storage = new DatabaseStorage();