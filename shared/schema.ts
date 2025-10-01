import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Removed users table for single-user design

export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
});

export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  exerciseId: varchar("exercise_id").references(() => exercises.id).notNull(),
  startingValue: real("starting_value").notNull(),
  targetValue: real("target_value").notNull(),
  targetDate: timestamp("target_date").notNull(),
  currentValue: real("current_value").default(0),
  unit: text("unit").notNull().default("KGs"),
  isActive: integer("is_active").default(1), // 1 = active, 0 = completed/inactive
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Renamed to workoutProgress as per architecture document
export const workoutProgress = pgTable("workoutProgress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  exerciseId: varchar("exercise_id").references(() => exercises.id).notNull(),
  value: real("value").notNull(),
  progressDate: timestamp("progress_date").defaultNow().notNull(),
  notes: text("notes"),
});

// Zod schemas
export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
}).extend({
  startingValue: z.coerce.number().min(0),
  targetValue: z.coerce.number().positive(),
  currentValue: z.coerce.number().min(0).optional(),
  targetDate: z.coerce.date(), // Accept string or Date, coerce to Date
  unit: z.string().min(1, "Unit is required"),
});

export const insertWorkoutProgressSchema = createInsertSchema(workoutProgress).omit({
  id: true,
  progressDate: true,
}).extend({
  value: z.coerce.number().positive(),
});

// Types
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercises.$inferSelect;

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

export type InsertWorkoutProgress = z.infer<typeof insertWorkoutProgressSchema>;
export type WorkoutProgress = typeof workoutProgress.$inferSelect;

// Extended types for joined queries
export type GoalWithExercise = Goal & {
  exercise: Exercise;
};

export type WorkoutProgressWithExercise = WorkoutProgress & {
  exercise: Exercise;
};