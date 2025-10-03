import { Router } from "express";
import { storage } from "../storage.js";
import { insertWorkoutProgressSchema } from "../../shared/schema.js";

export const workoutProgressRouter = Router();

// GET /api/workout-progress - List all progress entries
workoutProgressRouter.get('/', async (req, res, next) => {
  try {
    const { limit } = req.query;
    const limitNum = limit ? parseInt(limit as string, 10) : undefined;

    if (limitNum && (isNaN(limitNum) || limitNum <= 0)) {
      return res.status(400).json({ message: 'Limit must be a positive number' });
    }

    const progress = limitNum
      ? await storage.getRecentWorkoutProgress(limitNum)
      : await storage.getAllWorkoutProgress();

    res.json(progress);
  } catch (error) {
    next(error);
  }
});

// GET /api/workout-progress/exercise/:exerciseId - Progress for specific exercise
workoutProgressRouter.get('/exercise/:exerciseId', async (req, res, next) => {
  try {
    const { exerciseId } = req.params;
    const progress = await storage.getWorkoutProgressByExercise(exerciseId);
    res.json(progress);
  } catch (error) {
    next(error);
  }
});

// GET /api/workout-progress/recent - Recent progress for charts
workoutProgressRouter.get('/recent', async (req, res, next) => {
  try {
    const { limit, days } = req.query;
    const limitNum = limit ? parseInt(limit as string, 10) : 20;

    if (isNaN(limitNum) || limitNum <= 0) {
      return res.status(400).json({ message: 'Limit must be a positive number' });
    }

    let progress = await storage.getRecentWorkoutProgress(limitNum);

    // Filter by days if specified
    if (days) {
      const daysNum = parseInt(days as string, 10);
      if (isNaN(daysNum) || daysNum <= 0) {
        return res.status(400).json({ message: 'Days must be a positive number' });
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysNum);

      progress = progress.filter(p => new Date(p.progressDate) >= cutoffDate);
    }

    res.json(progress);
  } catch (error) {
    next(error);
  }
});

// POST /api/workout-progress - Log new progress
workoutProgressRouter.post('/', async (req, res, next) => {
  try {
    const validatedData = insertWorkoutProgressSchema.parse(req.body);

    // Business logic validation
    if (validatedData.value <= 0) {
      return res.status(400).json({
        message: 'Progress value must be greater than zero'
      });
    }

    // The storage layer will automatically update goal currentValue
    const progress = await storage.createWorkoutProgress(validatedData);
    res.status(201).json(progress);
  } catch (error) {
    next(error);
  }
});

// GET /api/workout-progress/:id - Get specific progress entry
workoutProgressRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Since we don't have a direct getWorkoutProgress method, we'll get all and filter
    // In a production app, we'd add this method to the storage interface
    const allProgress = await storage.getAllWorkoutProgress();
    const progress = allProgress.find(p => p.id === id);

    if (!progress) {
      return res.status(404).json({ message: 'Progress entry not found' });
    }

    res.json(progress);
  } catch (error) {
    next(error);
  }
});

// PUT /api/workout-progress/:id - Update progress entry
workoutProgressRouter.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = insertWorkoutProgressSchema.partial().parse(req.body);

    if (validatedData.value !== undefined && validatedData.value <= 0) {
      return res.status(400).json({
        message: 'Progress value must be greater than zero'
      });
    }

    const progress = await storage.updateWorkoutProgress(id, validatedData);
    if (!progress) {
      return res.status(404).json({ message: 'Progress entry not found' });
    }

    res.json(progress);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/workout-progress/:id - Delete progress entry
workoutProgressRouter.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await storage.deleteWorkoutProgress(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Progress entry not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});