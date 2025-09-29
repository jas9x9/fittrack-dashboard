# FitTrack Dashboard API Documentation

## Overview

The FitTrack Dashboard API is a RESTful API that provides endpoints for managing exercises, fitness goals, and workout progress. All endpoints return JSON responses and use standard HTTP status codes.

**Base URL:** `/api`
**Content-Type:** `application/json`

## Authentication

The current version is designed for single-user deployment and does not require authentication. All endpoints are publicly accessible within your deployment environment.

## Rate Limiting

- **Development:** No rate limiting
- **Production:** 100 requests per minute per IP address
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: Unix timestamp when window resets

## Error Handling

All errors follow a consistent format:

```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error message"
    }
  ]
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## Health Check Endpoints

### Basic Health Check

**GET** `/api/health`

Returns basic API health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}
```

### Detailed Health Check

**GET** `/api/health/detailed`

Returns comprehensive system health information.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "responseTime": 25,
  "version": "1.0.0",
  "database": {
    "status": "connected",
    "responseTime": 15
  },
  "memory": {
    "rss": 45,
    "heapTotal": 20,
    "heapUsed": 15,
    "external": 2
  },
  "system": {
    "nodeVersion": "v18.17.0",
    "platform": "linux",
    "uptime": 3600,
    "environment": "production"
  },
  "checks": {
    "database": "pass",
    "memory": "pass",
    "uptime": "pass"
  }
}
```

### Readiness Probe

**GET** `/api/health/readiness`

Kubernetes-style readiness probe.

**Response:**
```json
{
  "ready": true
}
```

### Liveness Probe

**GET** `/api/health/liveness`

Kubernetes-style liveness probe.

**Response:**
```json
{
  "alive": true
}
```

---

## Exercises

### List All Exercises

**GET** `/api/exercises`

Retrieves all available exercises.

**Response:**
```json
[
  {
    "id": "exercise_123",
    "name": "Push-ups"
  },
  {
    "id": "exercise_124",
    "name": "Running (miles)"
  }
]
```

### Get Exercise by ID

**GET** `/api/exercises/:id`

Retrieves a specific exercise by ID.

**Parameters:**
- `id` (string, required) - Exercise ID

**Response:**
```json
{
  "id": "exercise_123",
  "name": "Push-ups"
}
```

**Error Responses:**
- `404` - Exercise not found

### Create Exercise

**POST** `/api/exercises`

Creates a new exercise.

**Request Body:**
```json
{
  "name": "Pull-ups"
}
```

**Validation:**
- `name` (string, required) - Exercise name (1-255 characters)

**Response:**
```json
{
  "id": "exercise_125",
  "name": "Pull-ups"
}
```

**Error Responses:**
- `400` - Validation error

### Update Exercise

**PUT** `/api/exercises/:id`

Updates an existing exercise.

**Parameters:**
- `id` (string, required) - Exercise ID

**Request Body:**
```json
{
  "name": "Pull-ups (Modified)"
}
```

**Response:**
```json
{
  "id": "exercise_125",
  "name": "Pull-ups (Modified)"
}
```

**Error Responses:**
- `400` - Validation error
- `404` - Exercise not found

### Delete Exercise

**DELETE** `/api/exercises/:id`

Deletes an exercise.

**Parameters:**
- `id` (string, required) - Exercise ID

**Response:**
```json
{
  "success": true,
  "message": "Exercise deleted successfully"
}
```

**Error Responses:**
- `404` - Exercise not found
- `400` - Cannot delete exercise with existing goals

---

## Goals

### List All Goals

**GET** `/api/goals`

Retrieves all goals with associated exercise information.

**Response:**
```json
[
  {
    "id": "goal_123",
    "exerciseId": "exercise_123",
    "targetValue": 100,
    "targetDate": "2024-02-01T00:00:00.000Z",
    "currentValue": 45,
    "isActive": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "exercise": {
      "id": "exercise_123",
      "name": "Push-ups"
    }
  }
]
```

### Get Goal by ID

**GET** `/api/goals/:id`

Retrieves a specific goal by ID.

**Parameters:**
- `id` (string, required) - Goal ID

**Response:**
```json
{
  "id": "goal_123",
  "exerciseId": "exercise_123",
  "targetValue": 100,
  "targetDate": "2024-02-01T00:00:00.000Z",
  "currentValue": 45,
  "isActive": 1,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `404` - Goal not found

### Create Goal

**POST** `/api/goals`

Creates a new fitness goal.

**Request Body:**
```json
{
  "exerciseId": "exercise_123",
  "targetValue": 100,
  "targetDate": "2024-02-01T00:00:00.000Z",
  "currentValue": 0
}
```

**Validation:**
- `exerciseId` (string, required) - Valid exercise ID
- `targetValue` (number, required) - Target value (> 0)
- `targetDate` (string/Date, required) - Target date (future date)
- `currentValue` (number, optional) - Starting value (default: 0)

**Response:**
```json
{
  "id": "goal_124",
  "exerciseId": "exercise_123",
  "targetValue": 100,
  "targetDate": "2024-02-01T00:00:00.000Z",
  "currentValue": 0,
  "isActive": 1,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `400` - Validation error
- `404` - Exercise not found

### Update Goal

**PUT** `/api/goals/:id`

Updates an existing goal.

**Parameters:**
- `id` (string, required) - Goal ID

**Request Body:**
```json
{
  "targetValue": 120,
  "targetDate": "2024-02-15T00:00:00.000Z",
  "currentValue": 50
}
```

**Validation:**
- `targetValue` (number, optional) - Target value (> 0)
- `targetDate` (string/Date, optional) - Target date
- `currentValue` (number, optional) - Current value (>= 0)

**Response:**
```json
{
  "id": "goal_123",
  "exerciseId": "exercise_123",
  "targetValue": 120,
  "targetDate": "2024-02-15T00:00:00.000Z",
  "currentValue": 50,
  "isActive": 1,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400` - Validation error
- `404` - Goal not found

### Delete Goal

**DELETE** `/api/goals/:id`

Deletes a goal and all associated workout progress.

**Parameters:**
- `id` (string, required) - Goal ID

**Response:**
```json
{
  "success": true,
  "message": "Goal deleted successfully"
}
```

**Error Responses:**
- `404` - Goal not found

---

## Workout Progress

### List All Workout Progress

**GET** `/api/workout-progress`

Retrieves all workout progress entries with exercise information.

**Query Parameters:**
- `limit` (number, optional) - Maximum number of entries to return
- `exerciseId` (string, optional) - Filter by exercise ID

**Response:**
```json
[
  {
    "id": "progress_123",
    "exerciseId": "exercise_123",
    "value": 50,
    "progressDate": "2024-01-15T00:00:00.000Z",
    "notes": "Felt strong today!",
    "exercise": {
      "id": "exercise_123",
      "name": "Push-ups"
    }
  }
]
```

### Get Progress by Exercise

**GET** `/api/workout-progress/exercise/:exerciseId`

Retrieves workout progress for a specific exercise.

**Parameters:**
- `exerciseId` (string, required) - Exercise ID

**Response:**
```json
[
  {
    "id": "progress_123",
    "exerciseId": "exercise_123",
    "value": 50,
    "progressDate": "2024-01-15T00:00:00.000Z",
    "notes": "Felt strong today!"
  }
]
```

### Get Recent Progress

**GET** `/api/workout-progress/recent`

Retrieves recent workout progress entries for charts and analytics.

**Query Parameters:**
- `limit` (number, optional, default: 50) - Maximum entries to return

**Response:**
```json
[
  {
    "id": "progress_123",
    "exerciseId": "exercise_123",
    "value": 50,
    "progressDate": "2024-01-15T00:00:00.000Z",
    "notes": "Felt strong today!",
    "exercise": {
      "id": "exercise_123",
      "name": "Push-ups"
    }
  }
]
```

### Log Workout Progress

**POST** `/api/workout-progress`

Logs a new workout progress entry. Automatically updates related goal's current value.

**Request Body:**
```json
{
  "exerciseId": "exercise_123",
  "value": 55,
  "notes": "Personal best!"
}
```

**Validation:**
- `exerciseId` (string, required) - Valid exercise ID
- `value` (number, required) - Progress value (> 0)
- `notes` (string, optional) - Progress notes (max 500 characters)

**Response:**
```json
{
  "id": "progress_124",
  "exerciseId": "exercise_123",
  "value": 55,
  "progressDate": "2024-01-15T10:30:00.000Z",
  "notes": "Personal best!"
}
```

**Side Effects:**
- Updates related goal's `currentValue` to the maximum progress value
- Creates goal completion notification if target is reached

**Error Responses:**
- `400` - Validation error
- `404` - Exercise not found

### Update Workout Progress

**PUT** `/api/workout-progress/:id`

Updates an existing workout progress entry.

**Parameters:**
- `id` (string, required) - Progress entry ID

**Request Body:**
```json
{
  "value": 60,
  "notes": "Updated - even better!"
}
```

**Response:**
```json
{
  "id": "progress_123",
  "exerciseId": "exercise_123",
  "value": 60,
  "progressDate": "2024-01-15T00:00:00.000Z",
  "notes": "Updated - even better!"
}
```

**Error Responses:**
- `400` - Validation error
- `404` - Progress entry not found

### Delete Workout Progress

**DELETE** `/api/workout-progress/:id`

Deletes a workout progress entry.

**Parameters:**
- `id` (string, required) - Progress entry ID

**Response:**
```json
{
  "success": true,
  "message": "Progress entry deleted successfully"
}
```

**Error Responses:**
- `404` - Progress entry not found

---

## Monitoring Endpoints

### Log Client Errors

**POST** `/api/client-errors`

Logs client-side errors for monitoring and debugging.

**Request Body:**
```json
{
  "errorId": "error_123456",
  "message": "TypeError: Cannot read property 'name' of undefined",
  "stack": "Error stack trace...",
  "componentStack": "React component stack...",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "userAgent": "Mozilla/5.0...",
  "url": "http://localhost:3000/goals",
  "userId": "anonymous"
}
```

**Response:**
```json
{
  "success": true,
  "errorId": "error_123456",
  "message": "Error logged successfully"
}
```

### Log API Metrics

**POST** `/api/metrics`

Logs API performance metrics.

**Request Body:**
```json
{
  "endpoint": "/api/goals",
  "method": "GET",
  "status": 200,
  "duration": 150,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "success": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Metrics logged successfully"
}
```

---

## Data Models

### Exercise
```typescript
interface Exercise {
  id: string;
  name: string;
}
```

### Goal
```typescript
interface Goal {
  id: string;
  exerciseId: string;
  targetValue: number;
  targetDate: Date;
  currentValue: number;
  isActive: number; // 1 = active, 0 = completed/inactive
  createdAt: Date;
}
```

### GoalWithExercise
```typescript
interface GoalWithExercise extends Goal {
  exercise: Exercise;
}
```

### WorkoutProgress
```typescript
interface WorkoutProgress {
  id: string;
  exerciseId: string;
  value: number;
  progressDate: Date;
  notes: string | null;
}
```

### WorkoutProgressWithExercise
```typescript
interface WorkoutProgressWithExercise extends WorkoutProgress {
  exercise: Exercise;
}
```

---

## Examples

### Complete Workout Flow

1. **Create an exercise:**
   ```bash
   curl -X POST http://localhost:3000/api/exercises \
     -H "Content-Type: application/json" \
     -d '{"name": "Squats"}'
   ```

2. **Create a goal:**
   ```bash
   curl -X POST http://localhost:3000/api/goals \
     -H "Content-Type: application/json" \
     -d '{
       "exerciseId": "exercise_123",
       "targetValue": 100,
       "targetDate": "2024-02-01T00:00:00.000Z",
       "currentValue": 0
     }'
   ```

3. **Log workout progress:**
   ```bash
   curl -X POST http://localhost:3000/api/workout-progress \
     -H "Content-Type: application/json" \
     -d '{
       "exerciseId": "exercise_123",
       "value": 25,
       "notes": "First workout session!"
     }'
   ```

4. **Check updated goal:**
   ```bash
   curl http://localhost:3000/api/goals/goal_123
   ```

### Error Handling Example

```bash
# Invalid request
curl -X POST http://localhost:3000/api/goals \
  -H "Content-Type: application/json" \
  -d '{"targetValue": -5}'

# Response:
{
  "message": "Validation error",
  "errors": [
    {
      "field": "exerciseId",
      "message": "Required"
    },
    {
      "field": "targetValue",
      "message": "Number must be greater than 0"
    }
  ]
}
```

---

## Rate Limiting Example

When rate limit is exceeded:

```json
{
  "message": "Too many requests",
  "retryAfter": 45,
  "limit": 100,
  "window": 60
}
```

**Headers:**
- `X-RateLimit-Limit: 100`
- `X-RateLimit-Remaining: 0`
- `X-RateLimit-Reset: 1705315800`

---

## Support

For API-related issues:
1. Check the application logs
2. Verify your request format matches the examples
3. Ensure your database connection is working
4. Review the health check endpoints for system status

For detailed error information, enable debug logging by setting `LOG_LEVEL=debug` in your environment.