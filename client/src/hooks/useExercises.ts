import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exercisesApi, type Exercise, type CreateExerciseRequest } from '@/api';
import { toast } from '@/hooks/use-toast';
import { goalKeys } from './useGoals';
import { workoutProgressKeys } from './useWorkoutProgress';

// Query keys for exercises
export const exerciseKeys = {
  all: ['exercises'] as const,
  detail: (id: string) => ['exercises', id] as const,
};

// Get all exercises
export function useExercises() {
  return useQuery({
    queryKey: exerciseKeys.all,
    queryFn: exercisesApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get exercise by ID
export function useExercise(id: string) {
  return useQuery({
    queryKey: exerciseKeys.detail(id),
    queryFn: () => exercisesApi.getById(id),
    enabled: !!id,
  });
}

// Create exercise mutation
export function useCreateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExerciseRequest) => exercisesApi.create(data),
    onSuccess: (newExercise) => {
      // Update the exercises cache
      queryClient.setQueryData<Exercise[]>(exerciseKeys.all, (old) =>
        old ? [...old, newExercise] : [newExercise]
      );

      toast({
        title: 'Exercise created',
        description: `${newExercise.name} has been added successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating exercise',
        description: error instanceof Error ? error.message : 'Failed to create exercise',
        variant: 'destructive',
      });
    },
  });
}

// Update exercise mutation
export function useUpdateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateExerciseRequest> }) =>
      exercisesApi.update(id, data),
    onSuccess: (updatedExercise) => {
      // Update both the list and detail caches
      queryClient.setQueryData<Exercise[]>(exerciseKeys.all, (old) =>
        old ? old.map((exercise) =>
          exercise.id === updatedExercise.id ? updatedExercise : exercise
        ) : [updatedExercise]
      );

      queryClient.setQueryData(exerciseKeys.detail(updatedExercise.id), updatedExercise);

      toast({
        title: 'Exercise updated',
        description: `${updatedExercise.name} has been updated successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating exercise',
        description: error instanceof Error ? error.message : 'Failed to update exercise',
        variant: 'destructive',
      });
    },
  });
}

// Delete exercise mutation
export function useDeleteExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => exercisesApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from exercises cache
      queryClient.setQueryData<Exercise[]>(exerciseKeys.all, (old) =>
        old ? old.filter((exercise) => exercise.id !== deletedId) : []
      );

      // Remove detail cache
      queryClient.removeQueries({ queryKey: exerciseKeys.detail(deletedId) });

      // Invalidate goals and workout progress caches
      // (cascade delete in DB removes associated records, need to refresh cache)
      queryClient.invalidateQueries({ queryKey: goalKeys.all });
      queryClient.invalidateQueries({ queryKey: workoutProgressKeys.all });
      queryClient.invalidateQueries({ queryKey: workoutProgressKeys.byExercise(deletedId) });

      toast({
        title: 'Exercise deleted',
        description: 'Exercise has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting exercise',
        description: error instanceof Error ? error.message : 'Failed to delete exercise',
        variant: 'destructive',
      });
    },
  });
}