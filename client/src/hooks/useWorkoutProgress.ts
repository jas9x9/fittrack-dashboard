import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  workoutProgressApi,
  type WorkoutProgress,
  type WorkoutProgressWithExercise,
  type CreateWorkoutProgressRequest,
  type UpdateWorkoutProgressRequest
} from '@/api';
import { toast } from '@/hooks/use-toast';
import { goalKeys } from './useGoals';

// Query keys for workout progress
export const workoutProgressKeys = {
  all: ['workoutProgress'] as const,
  byExercise: (exerciseId: string) => ['workoutProgress', 'exercise', exerciseId] as const,
  recent: (limit?: number, days?: number) => ['workoutProgress', 'recent', limit, days] as const,
  detail: (id: string) => ['workoutProgress', id] as const,
};

// Get all workout progress
export function useWorkoutProgress(limit?: number) {
  return useQuery({
    queryKey: workoutProgressKeys.all,
    queryFn: () => workoutProgressApi.getAll(limit),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Get progress for specific exercise
export function useWorkoutProgressByExercise(exerciseId: string) {
  return useQuery({
    queryKey: workoutProgressKeys.byExercise(exerciseId),
    queryFn: () => workoutProgressApi.getByExercise(exerciseId),
    enabled: !!exerciseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get recent progress for charts
export function useRecentWorkoutProgress(limit: number = 20, days?: number) {
  return useQuery({
    queryKey: workoutProgressKeys.recent(limit, days),
    queryFn: () => workoutProgressApi.getRecent(limit, days),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Get specific progress entry
export function useWorkoutProgressEntry(id: string) {
  return useQuery({
    queryKey: workoutProgressKeys.detail(id),
    queryFn: () => workoutProgressApi.getById(id),
    enabled: !!id,
  });
}

// Create workout progress mutation (auto-updates goals)
export function useLogWorkoutProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkoutProgressRequest) => workoutProgressApi.create(data),
    onSuccess: (newProgress) => {
      // Invalidate all workout progress queries
      queryClient.invalidateQueries({ queryKey: workoutProgressKeys.all });
      queryClient.invalidateQueries({
        queryKey: workoutProgressKeys.byExercise(newProgress.exerciseId)
      });
      queryClient.invalidateQueries({ queryKey: workoutProgressKeys.recent() });

      // Invalidate goals cache since progress auto-updates goals
      queryClient.invalidateQueries({ queryKey: goalKeys.all });

      toast({
        title: 'Progress logged! 💪',
        description: 'Your workout progress has been recorded and goals updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error logging progress',
        description: error instanceof Error ? error.message : 'Failed to log workout progress',
        variant: 'destructive',
      });
    },
  });
}

// Update workout progress mutation
export function useUpdateWorkoutProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkoutProgressRequest }) =>
      workoutProgressApi.update(id, data),
    onSuccess: (updatedProgress) => {
      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: workoutProgressKeys.all });
      queryClient.invalidateQueries({
        queryKey: workoutProgressKeys.byExercise(updatedProgress.exerciseId)
      });
      queryClient.invalidateQueries({ queryKey: workoutProgressKeys.recent() });

      // Update detail cache
      queryClient.setQueryData(workoutProgressKeys.detail(updatedProgress.id), updatedProgress);

      toast({
        title: 'Progress updated',
        description: 'Your workout progress has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating progress',
        description: error instanceof Error ? error.message : 'Failed to update progress',
        variant: 'destructive',
      });
    },
  });
}

// Delete workout progress mutation
export function useDeleteWorkoutProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workoutProgressApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from all relevant caches
      queryClient.setQueryData<WorkoutProgressWithExercise[]>(
        workoutProgressKeys.all,
        (old) => old ? old.filter((progress) => progress.id !== deletedId) : []
      );

      // Invalidate other caches
      queryClient.invalidateQueries({ queryKey: workoutProgressKeys.recent() });

      // Remove detail cache
      queryClient.removeQueries({ queryKey: workoutProgressKeys.detail(deletedId) });

      toast({
        title: 'Progress entry deleted',
        description: 'Workout progress entry has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting progress',
        description: error instanceof Error ? error.message : 'Failed to delete progress',
        variant: 'destructive',
      });
    },
  });
}