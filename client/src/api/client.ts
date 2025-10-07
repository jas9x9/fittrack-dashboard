// Base API client configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
    public errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API monitoring interface
interface ApiMetrics {
  endpoint: string;
  method: string;
  status: number;
  duration: number;
  timestamp: string;
  success: boolean;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Log API metrics for monitoring
  private logApiMetrics(metrics: ApiMetrics) {
    if (process.env.NODE_ENV === 'development') {
      const status = metrics.success ? '✅' : '❌';
      console.log(`${status} API ${metrics.method} ${metrics.endpoint} - ${metrics.status} (${metrics.duration}ms)`);
      if (!metrics.success && metrics.error) {
        console.error(`Error: ${metrics.error}`);
      }
    }

    // In production, send metrics to monitoring endpoint
    if (process.env.NODE_ENV === 'production') {
      try {
        fetch('/api/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metrics),
        }).catch(() => {
          // Silently fail - don't break app if monitoring fails
        });
      } catch {
        // Silently fail
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const method = options.method || 'GET';
    const startTime = Date.now();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const duration = Date.now() - startTime;

      // Handle different response types
      let data;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Log successful request metrics
      this.logApiMetrics({
        endpoint,
        method,
        status: response.status,
        duration,
        timestamp: new Date().toISOString(),
        success: response.ok
      });

      if (!response.ok) {
        const apiError = new ApiError(
          response.status,
          response.statusText,
          data?.message || 'An error occurred',
          data?.errors
        );

        // Log error metrics
        this.logApiMetrics({
          endpoint,
          method,
          status: response.status,
          duration,
          timestamp: new Date().toISOString(),
          success: false,
          error: apiError.message
        });

        throw apiError;
      }

      return data as T;
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof ApiError) {
        // Already logged above
        throw error;
      }

      // Network errors, etc.
      const networkError = new ApiError(
        0,
        'Network Error',
        error instanceof Error ? error.message : 'Network request failed'
      );

      // Log network error metrics
      this.logApiMetrics({
        endpoint,
        method,
        status: 0,
        duration,
        timestamp: new Date().toISOString(),
        success: false,
        error: networkError.message
      });

      throw networkError;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Health check
  async healthCheck() {
    return this.get<{
      status: string;
      timestamp: string;
      database: string;
      version: string;
    }>('/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Raw API response types (dates as strings from JSON)
export interface ExerciseApiResponse {
  id: string;
  name: string;
}

export interface GoalApiResponse {
  id: string;
  exerciseId: string;
  startingValue: number;
  targetValue: number;
  targetDate: string;  // ISO string from API
  currentValue: number;
  unit: string;
  isActive: number;
  createdAt: string;   // ISO string from API
}

export interface GoalWithExerciseApiResponse extends GoalApiResponse {
  exercise: ExerciseApiResponse;
}

export interface WorkoutProgressApiResponse {
  id: string;
  exerciseId: string;
  value: number;
  progressDate: string;  // ISO string from API
  notes: string | null;
}

export interface WorkoutProgressWithExerciseApiResponse extends WorkoutProgressApiResponse {
  exercise: ExerciseApiResponse;
}

// Frontend-friendly types (dates as Date objects)
export interface Exercise {
  id: string;
  name: string;
}

export interface Goal {
  id: string;
  exerciseId: string;
  startingValue: number;
  targetValue: number;
  targetDate: Date;     // Converted to Date object
  currentValue: number;
  unit: string;
  isActive: number;
  createdAt: Date;      // Converted to Date object
}

export interface GoalWithExercise extends Goal {
  exercise: Exercise;
}

export interface WorkoutProgress {
  id: string;
  exerciseId: string;
  value: number;
  progressDate: Date;   // Converted to Date object
  notes: string | null;
}

export interface WorkoutProgressWithExercise extends WorkoutProgress {
  exercise: Exercise;
}

// Request types for creating/updating data
export interface CreateExerciseRequest {
  name: string;
}

export interface CreateGoalRequest {
  exerciseId: string;
  startingValue: number;
  targetValue: number;
  targetDate: string | Date;  // Accept both for flexibility
  currentValue?: number;
  unit: string;
}

export interface UpdateGoalRequest {
  exerciseId?: string;
  startingValue?: number;
  targetValue?: number;
  targetDate?: string | Date;  // Accept both for flexibility
  currentValue?: number;
  unit?: string;
}

export interface CreateWorkoutProgressRequest {
  exerciseId: string;
  value: number;
  progressDate?: Date; // Optional date, defaults to now if not provided
  notes?: string;
}

export interface UpdateWorkoutProgressRequest {
  exerciseId?: string;
  value?: number;
  notes?: string;
}

// Date conversion utilities
export const dateUtils = {
  // Convert API string to Date object
  fromApiString(dateString: string): Date {
    return new Date(dateString);
  },

  // Convert Date object to API string
  toApiString(date: Date): string {
    return date.toISOString();
  },

  // Handle flexible date input (Date or string)
  normalizeDate(date: string | Date): string {
    if (date instanceof Date) {
      return date.toISOString();
    }
    return date;
  },

  // Format date for display
  formatForDisplay(date: Date): string {
    return date.toLocaleDateString();
  },

  // Format date for input fields (YYYY-MM-DD)
  formatForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  },

  // Check if date is in the future
  isFuture(date: Date): boolean {
    return date > new Date();
  },

  // Calculate days until target date
  daysUntil(targetDate: Date): number {
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
};

// API response converters
export const apiConverters = {
  // Convert Exercise (no dates to convert)
  exercise(apiResponse: ExerciseApiResponse): Exercise {
    return {
      id: apiResponse.id,
      name: apiResponse.name,
    };
  },

  // Convert Goal with date fields
  goal(apiResponse: GoalApiResponse): Goal {
    return {
      id: apiResponse.id,
      exerciseId: apiResponse.exerciseId,
      startingValue: apiResponse.startingValue,
      targetValue: apiResponse.targetValue,
      targetDate: dateUtils.fromApiString(apiResponse.targetDate),
      currentValue: apiResponse.currentValue,
      unit: apiResponse.unit,
      isActive: apiResponse.isActive,
      createdAt: dateUtils.fromApiString(apiResponse.createdAt),
    };
  },

  // Convert Goal with Exercise
  goalWithExercise(apiResponse: GoalWithExerciseApiResponse): GoalWithExercise {
    return {
      ...apiConverters.goal(apiResponse),
      exercise: apiConverters.exercise(apiResponse.exercise),
    };
  },

  // Convert WorkoutProgress
  workoutProgress(apiResponse: WorkoutProgressApiResponse): WorkoutProgress {
    return {
      id: apiResponse.id,
      exerciseId: apiResponse.exerciseId,
      value: apiResponse.value,
      progressDate: dateUtils.fromApiString(apiResponse.progressDate),
      notes: apiResponse.notes,
    };
  },

  // Convert WorkoutProgress with Exercise
  workoutProgressWithExercise(apiResponse: WorkoutProgressWithExerciseApiResponse): WorkoutProgressWithExercise {
    return {
      ...apiConverters.workoutProgress(apiResponse),
      exercise: apiConverters.exercise(apiResponse.exercise),
    };
  }
};