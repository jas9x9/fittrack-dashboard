// Centralized API exports
export * from './client';
export * from './exercises';
export * from './goals';
export * from './workoutProgress';

// Re-export commonly used items
export { apiClient, ApiError, dateUtils, apiConverters } from './client';
export { exercisesApi } from './exercises';
export { goalsApi } from './goals';
export { workoutProgressApi } from './workoutProgress';