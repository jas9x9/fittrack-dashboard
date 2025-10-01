# Starting Value Field Implementation - Context Document

## Session Date
October 1, 2025

## Project Overview
FitTrack Dashboard - A fitness tracking application with goals and workout progress tracking.

## Phase 2: Starting Value Field - COMPLETED ✅

### What We Implemented

#### Backend Changes
1. **Database Schema** (`shared/schema.ts`)
   - Added `startingValue: real("starting_value").notNull()` to goals table
   - Added validation in `insertGoalSchema` to ensure `startingValue >= 0`
   - Ran database migration (had to truncate existing data)

2. **API Routes** (`server/routes/goals.ts`)
   - Updated POST /api/goals validation: `targetValue > startingValue`
   - Auto-set `currentValue = startingValue` on goal creation
   - Removed debug console.log statements

3. **Storage Layer** (`server/storage.ts`)
   - Added `startingValue` to the select statement in `getAllGoals()`

4. **API Types** (`client/src/api/client.ts`)
   - Added `startingValue` to all Goal-related interfaces
   - Updated API converters to include startingValue

#### Frontend Changes
1. **AddGoalDialog** (`client/src/components/AddGoalDialog.tsx`)
   - Changed from "Current Value" to "Starting Value" input
   - Only shows `startingValue` field (not currentValue)
   - Validation: `targetValue > startingValue`
   - Form submission passes `startingValue` to backend

2. **GoalCard** (`client/src/components/GoalCard.tsx`)
   - Added `startingValue` prop to component
   - **Always displays** "Started at X units" text (no conditional)
   - Progress calculation: `(currentValue - startingValue) / (targetValue - startingValue)`
   - Handles edge cases: negative progress = 0%, >= target = 100%

3. **EditGoalDialog** (`client/src/components/EditGoalDialog.tsx`)
   - Added `startingValue` to Goal interface
   - Shows startingValue as **READ-ONLY** field (greyed out, disabled)
   - Position: Below Exercise field
   - Removed currentValue input completely
   - Validation: `targetValue > startingValue`
   - Submission: Keeps currentValue unchanged (only editable via Log Workout)

4. **Goals Page** (`client/src/pages/Goals.tsx`)
   - Updated `handleAddGoal` to set `currentValue = startingValue`
   - Passes `startingValue` to GoalCard component
   - Passes `startingValue` to EditGoalDialog component

5. **Seed Data** (`server/storage/seed.ts`)
   - Added `startingValue` to all sample goals
   - Successfully reseeded database

### Testing Results - All Passed ✅
- ✅ Created new goal with startingValue = 20, targetValue = 50 Reps
- ✅ Verified "Started at 20 Reps" displays on goal card
- ✅ Logged workout progress (value = 25), currentValue updated correctly
- ✅ Progress bar shows correct percentage: ~16.7% (5/30)
- ✅ EditGoalDialog shows startingValue as read-only below exercise field
- ✅ EditGoalDialog removed currentValue input

### Git Status
- Branch: `feature/add-starting-value-field`
- Commits: 2 commits
  1. Backend and database changes
  2. Frontend UI updates and cleanup
- Status: **Pushed to GitHub** ✅
- PR Link: https://github.com/jas9x9/fittrack-dashboard/pull/new/feature/add-starting-value-field

## Phase 3: Edge Cases Handling - TODO

### Edge Case 1: Performance Deterioration
**Scenario**: User logs workout progress with value < startingValue (e.g., startingValue = 20, user logs 15)

**Behavior**:
- Show `ResetBaselineDialog` popup
- Message: "Your performance has decreased. Would you like to reset your baseline to 15 Reps?"
- Options:
  - "Reset Baseline" → Update `startingValue = 15`, recalculate progress
  - "Keep Current Baseline" → Log workout but keep startingValue = 20

**Implementation Tasks**:
1. ✅ Design ResetBaselineDialog component with confirmation UI
2. ✅ Implement ResetBaselineDialog: Trigger when currentValue < startingValue
3. ✅ Add logic to detect performance deterioration in AddWorkoutDialog
4. ✅ Connect ResetBaselineDialog to reset startingValue to new baseline
5. ✅ Test Edge Case 1: Log workout with value < startingValue shows dialog
6. ✅ Test Edge Case 1: Reset baseline updates startingValue correctly

### Edge Case 2: Goal Achievement
**Scenario**: User logs workout progress with value >= targetValue (e.g., targetValue = 50, user logs 50 or 55)

**Behavior**:
- Show `NewTargetDialog` popup with congratulations
- Message: "🎉 Congratulations! You've reached your target of 50 Reps! Set a new target?"
- Options:
  - Input field for new target value (default: current targetValue + 10%)
  - "Set New Target" → Update `targetValue = newValue`
  - "Keep Current Target" → Log workout but keep targetValue = 50

**Implementation Tasks**:
7. ✅ Design NewTargetDialog component with congratulations UI
8. ✅ Implement NewTargetDialog: Trigger when currentValue >= targetValue
9. ✅ Add logic to detect goal achievement in AddWorkoutDialog
10. ✅ Connect NewTargetDialog to set new target value
11. ✅ Test Edge Case 2: Log workout with value >= targetValue shows dialog
12. ✅ Test Edge Case 2: Set new target updates targetValue correctly
13. ✅ Final commit: Complete edge cases handling

### Technical Approach for Edge Cases

#### Where to Add Detection Logic
**File**: `client/src/components/AddWorkoutDialog.tsx`

**Location**: In the `handleSubmit` function, after successful workout progress logging

**Pseudo-code**:
```typescript
const handleSubmit = async (workoutData) => {
  // 1. Log workout progress via API
  await logProgressMutation.mutate(progressData);

  // 2. Get the goal for this exercise
  const goal = goals.find(g => g.exerciseId === workoutData.exerciseId);

  if (goal) {
    // 3. Check Edge Case 1: Performance Deterioration
    if (workoutData.value < goal.startingValue) {
      setShowResetBaselineDialog(true);
      setResetBaselineData({
        goalId: goal.id,
        newBaseline: workoutData.value
      });
      return; // Don't close dialog yet
    }

    // 4. Check Edge Case 2: Goal Achievement
    if (workoutData.value >= goal.targetValue) {
      setShowNewTargetDialog(true);
      setNewTargetData({
        goalId: goal.id,
        achievedValue: workoutData.value,
        suggestedTarget: goal.targetValue * 1.1 // +10%
      });
      return; // Don't close dialog yet
    }
  }

  // 5. Normal case: close dialog
  onOpenChange(false);
};
```

#### New Components to Create
1. **ResetBaselineDialog.tsx**
   - Uses `AlertDialog` from shadcn/ui
   - Props: `open`, `onOpenChange`, `goalId`, `currentBaseline`, `newBaseline`, `unit`
   - Actions: `onResetBaseline()`, `onKeepBaseline()`

2. **NewTargetDialog.tsx**
   - Uses `Dialog` from shadcn/ui
   - Props: `open`, `onOpenChange`, `goalId`, `currentTarget`, `achievedValue`, `unit`
   - Has input field for new target value
   - Actions: `onSetNewTarget(newValue)`, `onKeepTarget()`

#### Backend API Endpoints Needed
No new endpoints required! Use existing:
- `PUT /api/goals/:id` - Already supports updating `startingValue` and `targetValue`

### Key Design Decisions
1. **Starting value is NOT editable after creation** (only via Reset Baseline dialog)
2. **Current value is ONLY editable via Log Workout action** (not in EditGoalDialog)
3. **Progress calculation baseline** is always `startingValue`, not 0
4. **Edge case dialogs appear during workout logging**, not in EditGoalDialog
5. **"Started at X units" text always displays**, even when currentValue = startingValue

### Files Modified in Phase 2
Backend:
- `shared/schema.ts`
- `server/routes/goals.ts`
- `server/storage.ts`
- `server/storage/seed.ts`

Frontend:
- `client/src/api/client.ts`
- `client/src/components/AddGoalDialog.tsx`
- `client/src/components/GoalCard.tsx`
- `client/src/components/EditGoalDialog.tsx`
- `client/src/pages/Goals.tsx`

### Database State
- Migration applied with data truncation
- Seed data includes startingValue for 3 sample goals
- Test goal created: Push-ups (startingValue=20, currentValue=25, targetValue=50)

### Next Session Plan
1. Create feature branch: `feature/edge-cases-handling`
2. Implement ResetBaselineDialog component
3. Implement NewTargetDialog component
4. Add detection logic to AddWorkoutDialog
5. Test both edge cases thoroughly
6. Commit and push to GitHub

### Important Notes
- The server hot-reloads automatically (using tsx)
- Multiple background bash processes are running - use bash ID `1819fd` for latest
- Database is Neon PostgreSQL (serverless)
- Using Drizzle ORM with explicit `.select()` statements required

### Environment
- Node.js with tsx for TypeScript execution
- React + TypeScript frontend
- Express.js backend
- Drizzle ORM + Neon PostgreSQL
- Vite for frontend dev server
- Working Directory: `C:\Users\jaspr\OneDrive\Documents\Cursor\FitTrack\fittrack-dashboard`
