import { relations } from "drizzle-orm/relations";
import { exercises, workoutProgress, goals } from "./schema";

export const workoutProgressRelations = relations(workoutProgress, ({one}) => ({
	exercise: one(exercises, {
		fields: [workoutProgress.exerciseId],
		references: [exercises.id]
	}),
}));

export const exercisesRelations = relations(exercises, ({many}) => ({
	workoutProgresses: many(workoutProgress),
	goals: many(goals),
}));

export const goalsRelations = relations(goals, ({one}) => ({
	exercise: one(exercises, {
		fields: [goals.exerciseId],
		references: [exercises.id]
	}),
}));