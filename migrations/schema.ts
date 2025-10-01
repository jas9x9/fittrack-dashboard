import { pgTable, varchar, text, foreignKey, real, timestamp, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const exercises = pgTable("exercises", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	name: text().notNull(),
});

export const workoutProgress = pgTable("workoutProgress", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	exerciseId: varchar("exercise_id").notNull(),
	value: real().notNull(),
	progressDate: timestamp("progress_date", { mode: 'string' }).defaultNow().notNull(),
	notes: text(),
}, (table) => [
	foreignKey({
			columns: [table.exerciseId],
			foreignColumns: [exercises.id],
			name: "workoutProgress_exercise_id_exercises_id_fk"
		}),
]);

export const goals = pgTable("goals", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	exerciseId: varchar("exercise_id").notNull(),
	targetValue: real("target_value").notNull(),
	targetDate: timestamp("target_date", { mode: 'string' }).notNull(),
	currentValue: real("current_value").default(0),
	isActive: integer("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	unit: text().default('KGs').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.exerciseId],
			foreignColumns: [exercises.id],
			name: "goals_exercise_id_exercises_id_fk"
		}),
]);
