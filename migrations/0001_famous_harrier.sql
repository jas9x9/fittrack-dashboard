ALTER TABLE "workoutProgress" DROP CONSTRAINT "workoutProgress_exercise_id_exercises_id_fk";
--> statement-breakpoint
ALTER TABLE "goals" DROP CONSTRAINT "goals_exercise_id_exercises_id_fk";
--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "starting_value" real NOT NULL;--> statement-breakpoint
ALTER TABLE "workoutProgress" ADD CONSTRAINT "workoutProgress_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;