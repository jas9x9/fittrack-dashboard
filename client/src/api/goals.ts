import { apiClient, apiConverters, dateUtils } from './client';
import type {
  Goal,
  GoalWithExercise,
  GoalApiResponse,
  GoalWithExerciseApiResponse,
  CreateGoalRequest,
  UpdateGoalRequest
} from './client';

export const goalsApi = {
  // Get all goals with exercise details
  async getAll(): Promise<GoalWithExercise[]> {
    const response = await apiClient.get<GoalWithExerciseApiResponse[]>('/goals');
    return response.map(apiConverters.goalWithExercise);
  },

  // Get goal by ID (without exercise details)
  async getById(id: string): Promise<Goal> {
    const response = await apiClient.get<GoalApiResponse>(`/goals/${id}`);
    return apiConverters.goal(response);
  },

  // Create goal
  async create(data: CreateGoalRequest): Promise<Goal> {
    const requestData = {
      ...data,
      targetDate: dateUtils.normalizeDate(data.targetDate), // Convert Date to string if needed
    };

    const response = await apiClient.post<GoalApiResponse>('/goals', requestData);
    return apiConverters.goal(response);
  },

  // Update goal
  async update(id: string, data: UpdateGoalRequest): Promise<Goal> {
    const requestData = {
      ...data,
      targetDate: data.targetDate ? dateUtils.normalizeDate(data.targetDate) : undefined,
    };

    const response = await apiClient.put<GoalApiResponse>(`/goals/${id}`, requestData);
    return apiConverters.goal(response);
  },

  // Mark goal as complete
  async complete(id: string): Promise<{ message: string; goal: Goal }> {
    const response = await apiClient.put<{ message: string; goal: GoalApiResponse }>(`/goals/${id}/complete`);
    return {
      message: response.message,
      goal: apiConverters.goal(response.goal),
    };
  },

  // Delete goal
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/goals/${id}`);
  }
};