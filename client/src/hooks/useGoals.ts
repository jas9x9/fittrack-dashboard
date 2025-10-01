import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalsApi, type Goal, type GoalWithExercise, type CreateGoalRequest, type UpdateGoalRequest } from '@/api';
import { toast } from '@/hooks/use-toast';
import { workoutProgressKeys } from './useWorkoutProgress';

// Query keys for goals
export const goalKeys = {
  all: ['goals'] as const,
  detail: (id: string) => ['goals', id] as const,
};

// Get all goals with exercise details
export function useGoals() {
  return useQuery({
    queryKey: goalKeys.all,
    queryFn: goalsApi.getAll,
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter because goals update frequently)
  });
}

// Get goal by ID
export function useGoal(id: string) {
  return useQuery({
    queryKey: goalKeys.detail(id),
    queryFn: () => goalsApi.getById(id),
    enabled: !!id,
  });
}

// Create goal mutation
export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGoalRequest) => goalsApi.create(data),
    onSuccess: (newGoal) => {
      // Invalidate goals cache to refetch with exercise details
      queryClient.invalidateQueries({ queryKey: goalKeys.all });

      toast({
        title: 'Goal created',
        description: 'Your new fitness goal has been set successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating goal',
        description: error instanceof Error ? error.message : 'Failed to create goal',
        variant: 'destructive',
      });
    },
  });
}

// Update goal mutation
export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGoalRequest }) =>
      goalsApi.update(id, data),
    onSuccess: (updatedGoal) => {
      // Invalidate goals cache to refetch with updated exercise details
      queryClient.invalidateQueries({ queryKey: goalKeys.all });

      // Update detail cache
      queryClient.setQueryData(goalKeys.detail(updatedGoal.id), updatedGoal);

      toast({
        title: 'Goal updated',
        description: 'Your goal has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating goal',
        description: error instanceof Error ? error.message : 'Failed to update goal',
        variant: 'destructive',
      });
    },
  });
}

// Complete goal mutation
export function useCompleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goalsApi.complete(id),
    onSuccess: (response) => {
      // Invalidate goals cache to refetch updated data
      queryClient.invalidateQueries({ queryKey: goalKeys.all });

      // Update detail cache
      queryClient.setQueryData(goalKeys.detail(response.goal.id), response.goal);

      toast({
        title: 'Goal completed! 🎉',
        description: response.message,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error completing goal',
        description: error instanceof Error ? error.message : 'Failed to complete goal',
        variant: 'destructive',
      });
    },
  });
}

// Delete goal mutation
export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goalsApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from goals cache
      queryClient.setQueryData<GoalWithExercise[]>(goalKeys.all, (old) =>
        old ? old.filter((goal) => goal.id !== deletedId) : []
      );

      // Remove detail cache
      queryClient.removeQueries({ queryKey: goalKeys.detail(deletedId) });

      // Invalidate workout progress cache since backend deletes associated progress
      queryClient.invalidateQueries({ queryKey: workoutProgressKeys.all });

      toast({
        title: 'Goal deleted',
        description: 'Goal and all associated workout progress have been deleted.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting goal',
        description: error instanceof Error ? error.message : 'Failed to delete goal',
        variant: 'destructive',
      });
    },
  });
}