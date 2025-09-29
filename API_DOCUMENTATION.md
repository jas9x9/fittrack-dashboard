# FitTrack API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
No authentication required (single-user application).

## Error Responses

All endpoints return errors in the following format:
```json
{
  "message": "Error description"
}
```

For validation errors:
```json
{
  "message": "Validation error",
  "errors": [
    {
      "field": "field_name",
      "message": "Specific error message"
    }
  ]
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request (validation error)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error
- `503` - Service Unavailable (database connection failed)

---

## Health Check

### GET /health
Returns API health status and database connectivity.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-29T13:46:35.213Z",
  "database": "connected",
  "version": "1.0.0"
}
```

---

## Exercises

### GET /exercises
List all exercises.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Bench Press"
  }
]
```

### GET /exercises/:id
Get specific exercise.

**Response:**
```json
{
  "id": "uuid",
  "name": "Bench Press"
}
```

### POST /exercises
Create new exercise.

**Request Body:**
```json
{
  "name": "Pull-ups"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "Pull-ups"
}
```

### PUT /exercises/:id
Update exercise.

**Request Body:**
```json
{
  "name": "Updated Exercise Name"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Updated Exercise Name"
}
```

### DELETE /exercises/:id
Delete exercise.

**Response:** `204 No Content`

---

## Goals

### GET /goals
List all goals with exercise details.

**Response:**
```json
[
  {
    "id": "uuid",
    "exerciseId": "uuid",
    "targetValue": 150,
    "targetDate": "2025-12-28T13:18:59.185Z",
    "currentValue": 145,
    "isActive": 1,
    "createdAt": "2025-09-29T13:18:56.683Z",
    "exercise": {
      "id": "uuid",
      "name": "Bench Press"
    }
  }
]
```

### GET /goals/:id
Get specific goal.

**Response:**
```json
{
  "id": "uuid",
  "exerciseId": "uuid",
  "targetValue": 150,
  "targetDate": "2025-12-28T13:18:59.185Z",
  "currentValue": 145,
  "isActive": 1,
  "createdAt": "2025-09-29T13:18:56.683Z"
}
```

### POST /goals
Create new goal.

**Request Body:**
```json
{
  "exerciseId": "uuid",
  "targetValue": 150,
  "targetDate": "2025-12-31T00:00:00.000Z",
  "currentValue": 140
}
```

**Business Rules:**
- `targetValue` must be greater than `currentValue`
- `targetDate` must be in the future

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "exerciseId": "uuid",
  "targetValue": 150,
  "targetDate": "2025-12-31T00:00:00.000Z",
  "currentValue": 140,
  "isActive": 1,
  "createdAt": "2025-09-29T13:18:56.683Z"
}
```

### PUT /goals/:id
Update goal.

**Request Body:**
```json
{
  "targetValue": 155,
  "targetDate": "2025-12-31T00:00:00.000Z"
}
```

### PUT /goals/:id/complete
Mark goal as complete.

**Response:**
```json
{
  "message": "Goal marked as complete",
  "goal": { /* goal object */ }
}
```

### DELETE /goals/:id
Delete goal.

**Response:** `204 No Content`

---

## Workout Progress

### GET /workout-progress
List all workout progress entries.

**Query Parameters:**
- `limit` (optional): Number of entries to return

**Response:**
```json
[
  {
    "id": "uuid",
    "exerciseId": "uuid",
    "value": 145,
    "progressDate": "2025-09-29T13:49:20.206Z",
    "notes": "New personal record",
    "exercise": {
      "id": "uuid",
      "name": "Bench Press"
    }
  }
]
```

### GET /workout-progress/exercise/:exerciseId
Get progress entries for specific exercise.

**Response:**
```json
[
  {
    "id": "uuid",
    "exerciseId": "uuid",
    "value": 145,
    "progressDate": "2025-09-29T13:49:20.206Z",
    "notes": "New personal record"
  }
]
```

### GET /workout-progress/recent
Get recent progress entries for charts.

**Query Parameters:**
- `limit` (optional): Number of entries to return (default: 20)
- `days` (optional): Filter entries from last N days

**Response:**
```json
[
  {
    "id": "uuid",
    "exerciseId": "uuid",
    "value": 145,
    "progressDate": "2025-09-29T13:49:20.206Z",
    "notes": "New personal record",
    "exercise": {
      "id": "uuid",
      "name": "Bench Press"
    }
  }
]
```

### POST /workout-progress
Log new workout progress.

**Request Body:**
```json
{
  "exerciseId": "uuid",
  "value": 145,
  "notes": "Optional notes"
}
```

**Business Rules:**
- `value` must be greater than zero
- **Auto-updates goal**: Automatically updates the `currentValue` of goals for the same exercise

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "exerciseId": "uuid",
  "value": 145,
  "progressDate": "2025-09-29T13:49:20.206Z",
  "notes": "Optional notes"
}
```

### GET /workout-progress/:id
Get specific progress entry.

### PUT /workout-progress/:id
Update progress entry.

**Request Body:**
```json
{
  "value": 150,
  "notes": "Updated notes"
}
```

### DELETE /workout-progress/:id
Delete progress entry.

**Response:** `204 No Content`

---

## Smart Progress Logic

The API includes intelligent features:

### Auto-Goal Updates
When workout progress is logged via `POST /workout-progress`, the system automatically:
1. Finds all goals for the same exercise
2. Updates the goal's `currentValue` to the latest progress value
3. This enables real-time goal tracking without manual updates

### Goal Completion Detection
Goals are automatically managed:
- `isActive: 1` - Active goal
- `isActive: 0` - Completed goal (can be set via `PUT /goals/:id/complete`)

---

## Rate Limiting

- **Limit**: 100 requests per minute per IP
- **Response**: `429 Too Many Requests` when exceeded

---

## Data Types

### Exercise
```json
{
  "id": "string (UUID)",
  "name": "string"
}
```

### Goal
```json
{
  "id": "string (UUID)",
  "exerciseId": "string (UUID)",
  "targetValue": "number",
  "targetDate": "string (ISO date)",
  "currentValue": "number",
  "isActive": "number (0 or 1)",
  "createdAt": "string (ISO date)"
}
```

### WorkoutProgress
```json
{
  "id": "string (UUID)",
  "exerciseId": "string (UUID)",
  "value": "number",
  "progressDate": "string (ISO date)",
  "notes": "string | null"
}
```

---

## Example Usage

### Creating a Complete Workflow

1. **Create Exercise:**
```bash
curl -X POST http://localhost:3000/api/exercises \
  -H "Content-Type: application/json" \
  -d '{"name":"Deadlift"}'
```

2. **Set Goal:**
```bash
curl -X POST http://localhost:3000/api/goals \
  -H "Content-Type: application/json" \
  -d '{
    "exerciseId":"exercise-uuid",
    "currentValue":200,
    "targetValue":250,
    "targetDate":"2025-12-31T00:00:00.000Z"
  }'
```

3. **Log Progress (Auto-Updates Goal):**
```bash
curl -X POST http://localhost:3000/api/workout-progress \
  -H "Content-Type: application/json" \
  -d '{
    "exerciseId":"exercise-uuid",
    "value":220,
    "notes":"Great session!"
  }'
```

4. **Check Updated Goal:**
```bash
curl http://localhost:3000/api/goals
# currentValue will now be 220
```