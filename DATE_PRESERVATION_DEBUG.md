# Workout Progress Date Preservation Issue - Debug Log

**Date**: October 7, 2025
**Status**: ✅ **RESOLVED**
**Branch**: `fix/workout-progress-date`

## Problem Statement

When users log workout progress with a custom date (e.g., September 1st), the system ignored the selected date and recorded it as the current date (October 3rd) instead. This affected both the database storage and UI display.

## ✅ ROOT CAUSE IDENTIFIED

The issue was caused by a **mismatch between Drizzle ORM's expectations and what we were providing**:

### The Problem

1. **Zod Schema** was transforming ISO strings to Date objects:
   ```typescript
   progressDate: z.string().transform(val => new Date(val))
   ```

2. **Drizzle Column** (default mode) expects Date objects and calls `.toISOString()` internally:
   ```typescript
   progressDate: timestamp("progress_date").notNull().defaultNow()
   ```

3. When we removed the transform to keep it as a string, Drizzle still tried to call `.toISOString()` on the string, causing:
   ```
   TypeError: value.toISOString is not a function
   ```

4. When the error occurred, the field was ignored and PostgreSQL used the SQL default `defaultNow()`, recording the current date instead of the selected date.

## ✅ THE SOLUTION

### Two-Part Fix

**Part 1**: Configure Drizzle to accept ISO strings ([shared/schema.ts:30](shared/schema.ts:30))
```typescript
// ✅ CORRECT - Tell Drizzle to work with strings
progressDate: timestamp("progress_date", { mode: 'string' }).notNull().defaultNow()
```

**Part 2**: Keep Zod validation as string ([shared/schema.ts:54](shared/schema.ts:54))
```typescript
// ✅ CORRECT - Validate as ISO datetime string, no transformation
progressDate: z.string().datetime()
```

### Why This Works

1. **Frontend** sends: `"2025-09-20T11:00:00.000Z"` (ISO string)
2. **Zod** validates: Confirms it's a valid ISO datetime format
3. **Drizzle** receives: ISO string directly (with `{ mode: 'string' }`)
4. **PostgreSQL** stores: The exact datetime from the ISO string

The key insight: Drizzle's `timestamp()` column has two modes:
- **Default mode**: Expects JavaScript Date objects, calls `.toISOString()` before sending to DB
- **String mode (`{ mode: 'string' }`)**: Expects ISO strings, passes them directly to PostgreSQL

## Testing & Verification

### Test Performed
- ✅ Added workout entry for September 20, 2025
- ✅ Date preserved correctly in database
- ✅ Chart displays data point on correct date (Sept 20)
- ✅ No errors in console

### Server Logs Showing Success
```
📥 RAW REQUEST BODY: {
  "exerciseId": "69d40e49-c133-4f04-8b06-338499453109",
  "value": 125,
  "progressDate": "2025-09-20T11:00:00.000Z"
}
📥 progressDate from request: 2025-09-20T11:00:00.000Z
📥 Type of progressDate: string

✅ VALIDATED DATA: {
  "exerciseId": "69d40e49-c133-4f04-8b06-338499453109",
  "value": 125,
  "progressDate": "2025-09-20T11:00:00.000Z"
}
✅ progressDate after validation: 2025-09-20T11:00:00.000Z
✅ Type after validation: string

🔍 STORAGE LAYER - Received progress data: {
  "progressDate": "2025-09-20T11:00:00.000Z"
}
🔍 progressDate type: string

💾 STORED PROGRESS: {
  "progressDate": "2025-09-20T11:00:00.000Z"
}
```

## Files Modified

1. **`shared/schema.ts`**
   - Line 30: Added `{ mode: 'string' }` to timestamp column definition
   - Line 54: Changed from `.transform(val => new Date(val))` to `.datetime()`

2. **`server/storage.ts`**
   - Lines 143-150: Added debug logging (to be cleaned up)

3. **`server/routes/workoutProgress.ts`**
   - Lines 72-92: Debug logging in place

4. **Previous changes already in place:**
   - `client/src/api/client.ts`: progressDate field added to interface
   - `client/src/api/workoutProgress.ts`: Date normalization logic
   - `client/src/pages/Goals.tsx`: progressDate passed in all 3 submission handlers

## Impact

- ✅ **RESOLVED**: Users can now accurately log historical workout data
- ✅ Data integrity restored
- ✅ Ready for deployment

## Next Steps

1. ✅ Solution implemented and tested successfully
2. ⏳ Clean up debug logging code
3. ⏳ Commit changes to git
4. ⏳ Merge to main branch

## Lessons Learned

1. **Drizzle ORM has two modes for timestamps**: Always use `{ mode: 'string' }` when working with ISO strings
2. **Don't transform in Zod when Drizzle expects strings**: Let each layer handle its native format
3. **Debug logging is invaluable**: Tracing the data flow through each layer revealed the exact point of failure
4. **Test with actual data**: Server restarts and real user interactions exposed the issue that unit tests might have missed
