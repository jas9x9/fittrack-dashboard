import { Router } from "express";
import { storage } from "../storage";
import { insertGoalSchema } from "@shared/schema";

export const goalsRouter = Router();

// GET /api/goals - List all goals with exercise details
goalsRouter.get('/', async (req, res, next) => {
  try {
    const allGoals = await storage.getAllGoals();
    res.json(allGoals);
  } catch (error) {
    next(error);
  }
});

// GET /api/goals/:id - Get specific goal
goalsRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const goal = await storage.getGoal(id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json(goal);
  } catch (error) {
    next(error);
  }
});

// POST /api/goals - Create new goal
goalsRouter.post('/', async (req, res, next) => {
  try {
    const validatedData = insertGoalSchema.parse(req.body);

    // Business logic validation
    if (validatedData.targetValue <= (validatedData.currentValue || 0)) {
      return res.status(400).json({
        message: 'Target value must be greater than current value'
      });
    }

    // Check if target date is in the future
    const targetDate = new Date(validatedData.targetDate);
    if (targetDate <= new Date()) {
      return res.status(400).json({
        message: 'Target date must be in the future'
      });
    }

    const goal = await storage.createGoal(validatedData);
    res.status(201).json(goal);
  } catch (error) {
    next(error);
  }
});

// PUT /api/goals/:id - Update goal
goalsRouter.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = insertGoalSchema.partial().parse(req.body);

    // Business logic validation for updates
    if (validatedData.targetValue !== undefined && validatedData.currentValue !== undefined) {
      if (validatedData.targetValue <= validatedData.currentValue) {
        return res.status(400).json({
          message: 'Target value must be greater than current value'
        });
      }
    }

    if (validatedData.targetDate) {
      const targetDate = new Date(validatedData.targetDate);
      if (targetDate <= new Date()) {
        return res.status(400).json({
          message: 'Target date must be in the future'
        });
      }
    }

    const goal = await storage.updateGoal(id, validatedData);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json(goal);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/goals/:id - Delete goal
goalsRouter.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await storage.deleteGoal(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// PUT /api/goals/:id/complete - Mark goal as complete
goalsRouter.put('/:id/complete', async (req, res, next) => {
  try {
    const { id } = req.params;
    const goal = await storage.updateGoal(id, { isActive: 0 });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ message: 'Goal marked as complete', goal });
  } catch (error) {
    next(error);
  }
});