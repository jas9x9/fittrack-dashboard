import { apiClient, apiConverters, dateUtils } from './client';
import type {
  Exercise,
  ExerciseApiResponse,
  CreateExerciseRequest
} from './client';

export const exercisesApi = {
  // Get all exercises
  async getAll(): Promise<Exercise[]> {
    const response = await apiClient.get<ExerciseApiResponse[]>('/exercises');
    return response.map(apiConverters.exercise);
  },

  // Get exercise by ID
  async getById(id: string): Promise<Exercise> {
    const response = await apiClient.get<ExerciseApiResponse>(`/exercises/${id}`);
    return apiConverters.exercise(response);
  },

  // Create exercise
  async create(data: CreateExerciseRequest): Promise<Exercise> {
    const response = await apiClient.post<ExerciseApiResponse>('/exercises', data);
    return apiConverters.exercise(response);
  },

  // Update exercise
  async update(id: string, data: Partial<CreateExerciseRequest>): Promise<Exercise> {
    const response = await apiClient.put<ExerciseApiResponse>(`/exercises/${id}`, data);
    return apiConverters.exercise(response);
  },

  // Delete exercise
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/exercises/${id}`);
  }
};