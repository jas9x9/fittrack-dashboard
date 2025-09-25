import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  unit: text("unit").notNull(), // reps, minutes, kg, miles, etc
  description: text("description"),
});

export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  exerciseId: varchar("exercise_id").references(() => exercises.id).notNull(),
  targetValue: decimal("target_value", { precision: 10, scale: 2 }).notNull(),
  targetDate: timestamp("target_date").notNull(),
  currentValue: decimal("current_value", { precision: 10, scale: 2 }).default("0"),
  isActive: integer("is_active").default(1), // 1 = active, 0 = completed/inactive
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workoutSessions = pgTable("workout_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  exerciseId: varchar("exercise_id").references(() => exercises.id).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  sessionDate: timestamp("session_date").defaultNow().notNull(),
  notes: text("notes"),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  targetValue: z.coerce.number().positive(),
  currentValue: z.coerce.number().min(0).optional(),
});

export const insertWorkoutSessionSchema = createInsertSchema(workoutSessions).omit({
  id: true,
  userId: true,
  sessionDate: true,
}).extend({
  value: z.coerce.number().positive(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercises.$inferSelect;

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

export type InsertWorkoutSession = z.infer<typeof insertWorkoutSessionSchema>;
export type WorkoutSession = typeof workoutSessions.$inferSelect;

// Extended types for joined queries
export type GoalWithExercise = Goal & {
  exercise: Exercise;
};

export type WorkoutSessionWithExercise = WorkoutSession & {
  exercise: Exercise;
};