import { Router } from "express";
import { storage } from "../storage.js";
import { insertExerciseSchema } from "@shared/schema";
import { z } from "zod";

export const exercisesRouter = Router();

// GET /api/exercises - List all exercises
exercisesRouter.get('/', async (req, res, next) => {
  try {
    const exercises = await storage.getAllExercises();
    res.json(exercises);
  } catch (error) {
    next(error);
  }
});

// GET /api/exercises/:id - Get specific exercise
exercisesRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const exercise = await storage.getExercise(id);

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    res.json(exercise);
  } catch (error) {
    next(error);
  }
});

// POST /api/exercises - Create new exercise
exercisesRouter.post('/', async (req, res, next) => {
  try {
    const validatedData = insertExerciseSchema.parse(req.body);
    const exercise = await storage.createExercise(validatedData);
    res.status(201).json(exercise);
  } catch (error) {
    next(error);
  }
});

// PUT /api/exercises/:id - Update exercise
exercisesRouter.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = insertExerciseSchema.partial().parse(req.body);

    const exercise = await storage.updateExercise(id, validatedData);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    res.json(exercise);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/exercises/:id - Delete exercise
exercisesRouter.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await storage.deleteExercise(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});