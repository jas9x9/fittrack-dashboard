import { apiClient, apiConverters } from './client';
import type {
  WorkoutProgress,
  WorkoutProgressWithExercise,
  WorkoutProgressApiResponse,
  WorkoutProgressWithExerciseApiResponse,
  CreateWorkoutProgressRequest,
  UpdateWorkoutProgressRequest
} from './client';

export const workoutProgressApi = {
  // Get all workout progress entries
  async getAll(limit?: number): Promise<WorkoutProgressWithExercise[]> {
    const endpoint = limit ? `/workout-progress?limit=${limit}` : '/workout-progress';
    const response = await apiClient.get<WorkoutProgressWithExerciseApiResponse[]>(endpoint);
    return response.map(apiConverters.workoutProgressWithExercise);
  },

  // Get progress for specific exercise
  async getByExercise(exerciseId: string): Promise<WorkoutProgress[]> {
    const response = await apiClient.get<WorkoutProgressApiResponse[]>(`/workout-progress/exercise/${exerciseId}`);
    return response.map(apiConverters.workoutProgress);
  },

  // Get recent progress for charts
  async getRecent(limit: number = 20, days?: number): Promise<WorkoutProgressWithExercise[]> {
    let endpoint = `/workout-progress/recent?limit=${limit}`;
    if (days) {
      endpoint += `&days=${days}`;
    }

    const response = await apiClient.get<WorkoutProgressWithExerciseApiResponse[]>(endpoint);
    return response.map(apiConverters.workoutProgressWithExercise);
  },

  // Get specific progress entry
  async getById(id: string): Promise<WorkoutProgressWithExercise> {
    const response = await apiClient.get<WorkoutProgressWithExerciseApiResponse>(`/workout-progress/${id}`);
    return apiConverters.workoutProgressWithExercise(response);
  },

  // Log new progress (auto-updates goals)
  async create(data: CreateWorkoutProgressRequest): Promise<WorkoutProgress> {
    // Ensure we always have a date (use provided date or current date)
    const dateToUse = data.progressDate || new Date();

    // Normalize to noon to avoid timezone issues
    const normalizedDate = new Date(dateToUse);
    normalizedDate.setHours(12, 0, 0, 0);

    // Convert Date to ISO string for API
    const apiData = {
      ...data,
      progressDate: normalizedDate.toISOString(),
    };

    const response = await apiClient.post<WorkoutProgressApiResponse>('/workout-progress', apiData);
    return apiConverters.workoutProgress(response);
  },

  // Update progress entry
  async update(id: string, data: UpdateWorkoutProgressRequest): Promise<WorkoutProgress> {
    const response = await apiClient.put<WorkoutProgressApiResponse>(`/workout-progress/${id}`, data);
    return apiConverters.workoutProgress(response);
  },

  // Delete progress entry
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/workout-progress/${id}`);
  }
};