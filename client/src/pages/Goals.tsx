import { useState } from "react";
import { GoalCard } from "@/components/GoalCard";
import { AddGoalDialog } from "@/components/AddGoalDialog";
import { AddWorkoutDialog } from "@/components/AddWorkoutDialog";
import { EditGoalDialog } from "@/components/EditGoalDialog";
import { ResetBaselineDialog } from "@/components/ResetBaselineDialog";
import { NewTargetDialog } from "@/components/NewTargetDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from "@/hooks/useGoals";
import { useExercises } from "@/hooks/useExercises";
import { useLogWorkoutProgress, useWorkoutProgress } from "@/hooks/useWorkoutProgress";
import { dateUtils, type GoalWithExercise, type CreateGoalRequest, type UpdateGoalRequest, type CreateWorkoutProgressRequest } from "@/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, AlertCircle, Loader2 } from "lucide-react";

// Convert GoalWithExercise to GoalCard props format
function convertGoalForCard(goal: GoalWithExercise) {
  return {
    id: goal.id,
    exerciseName: goal.exercise?.name || 'Unknown Exercise',
    startingValue: goal.startingValue,
    currentValue: goal.currentValue,
    targetValue: goal.targetValue,
    unit: goal.unit || 'units',
    targetDate: dateUtils.formatForDisplay(goal.targetDate),
    daysLeft: dateUtils.daysUntil(goal.targetDate),
    isCompleted: goal.isActive === 0
  };
}

// Loading skeleton for goals
function GoalsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-32 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Goals() {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [selectedGoalForEdit, setSelectedGoalForEdit] = useState<GoalWithExercise | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>();

  // Edge case dialog states
  const [showResetBaselineDialog, setShowResetBaselineDialog] = useState(false);
  const [showNewTargetDialog, setShowNewTargetDialog] = useState(false);
  const [edgeCaseData, setEdgeCaseData] = useState<{
    goal: GoalWithExercise;
    newValue: number;
    workoutData: { exerciseId: string; value: number; date: Date; notes?: string };
  } | null>(null);

  const { toast } = useToast();

  // React Query hooks
  const { data: goals, isLoading: goalsLoading, error: goalsError } = useGoals();
  const { data: exercises, isLoading: exercisesLoading, error: exercisesError } = useExercises();
  const { data: allProgress, isLoading: progressLoading } = useWorkoutProgress();
  const createGoalMutation = useCreateGoal();
  const updateGoalMutation = useUpdateGoal();
  const deleteGoalMutation = useDeleteGoal();
  const logProgressMutation = useLogWorkoutProgress();


  const handleEditGoal = (id: string) => {
    const goal = goals?.find(g => g.id === id);
    if (goal) {
      setSelectedGoalForEdit(goal);
      setShowEditGoal(true);
    }
  };

  const handleUpdateGoal = (goalId: string, updates: { exerciseName: string; currentValue: number; targetValue: number; unit: string; targetDate: Date }) => {
    const updateData: UpdateGoalRequest = {
      currentValue: updates.currentValue,
      targetValue: updates.targetValue,
      targetDate: updates.targetDate,
    };

    updateGoalMutation.mutate({ id: goalId, data: updateData });
  };

  const handleDeleteGoal = (goalId: string) => {
    // Delete the goal (backend will also delete all associated workout progress)
    deleteGoalMutation.mutate(goalId, {
      onSuccess: () => {
        setShowEditGoal(false);
        setSelectedGoalForEdit(null);
      }
    });
  };

  const handleAddProgress = (goalId: string) => {
    const goal = goals?.find(g => g.id === goalId);
    if (goal) {
      setSelectedExerciseId(goal.exerciseId);
      setShowAddWorkout(true);
    }
  };

  const handleAddGoal = (goalData: { exerciseId: string; startingValue: number; targetValue: number; unit: string; targetDate: Date }) => {
    const createData: CreateGoalRequest = {
      exerciseId: goalData.exerciseId,
      startingValue: goalData.startingValue,
      currentValue: goalData.startingValue, // Set currentValue = startingValue initially
      targetValue: goalData.targetValue,
      unit: goalData.unit,
      targetDate: goalData.targetDate,
    };

    createGoalMutation.mutate(createData, {
      onSuccess: () => {
        setShowAddGoal(false);
      }
    });
  };

  const handleAddWorkout = (workoutData: { exerciseId: string; value: number; date: Date; notes?: string }) => {
    // Find the goal for this exercise to check for edge cases BEFORE logging
    const goal = goals?.find(g => g.exerciseId === workoutData.exerciseId);

    if (goal) {
      // Edge Case 1: Performance Deterioration (value < startingValue)
      if (workoutData.value < goal.startingValue) {
        setEdgeCaseData({ goal, newValue: workoutData.value, workoutData });
        setShowResetBaselineDialog(true);
        setShowAddWorkout(false);
        setSelectedExerciseId(undefined);
        return; // Don't log progress yet, wait for user confirmation
      }

      // Edge Case 2: Goal Achievement (value >= targetValue)
      if (workoutData.value >= goal.targetValue) {
        setEdgeCaseData({ goal, newValue: workoutData.value, workoutData });
        setShowNewTargetDialog(true);
        setShowAddWorkout(false);
        setSelectedExerciseId(undefined);
        return; // Don't log progress yet, wait for user confirmation
      }
    }

    // Normal case: log progress immediately
    const progressData: CreateWorkoutProgressRequest = {
      exerciseId: workoutData.exerciseId,
      value: workoutData.value,
      notes: workoutData.notes,
    };

    logProgressMutation.mutate(progressData, {
      onSuccess: () => {
        setShowAddWorkout(false);
        setSelectedExerciseId(undefined);
      }
    });
  };

  // Handle resetting baseline
  const handleResetBaseline = () => {
    if (!edgeCaseData) return;

    // First, log the workout progress
    const progressData: CreateWorkoutProgressRequest = {
      exerciseId: edgeCaseData.workoutData.exerciseId,
      value: edgeCaseData.workoutData.value,
      notes: edgeCaseData.workoutData.notes,
    };

    logProgressMutation.mutate(progressData, {
      onSuccess: () => {
        // Then update the goal's starting value
        const updateData: UpdateGoalRequest = {
          startingValue: edgeCaseData.newValue,
          currentValue: edgeCaseData.newValue,
        };

        updateGoalMutation.mutate({ id: edgeCaseData.goal.id, data: updateData }, {
          onSuccess: () => {
            toast({
              title: "Baseline Reset",
              description: `Your baseline has been reset to ${edgeCaseData.newValue} ${edgeCaseData.goal.unit}`,
            });
            setShowResetBaselineDialog(false);
            setEdgeCaseData(null);
          }
        });
      }
    });
  };

  // Handle keeping current baseline
  const handleKeepBaseline = () => {
    setShowResetBaselineDialog(false);
    setEdgeCaseData(null);
  };

  // Handle setting new target
  const handleSetNewTarget = (newTarget: number) => {
    if (!edgeCaseData) return;

    // First, log the workout progress
    const progressData: CreateWorkoutProgressRequest = {
      exerciseId: edgeCaseData.workoutData.exerciseId,
      value: edgeCaseData.workoutData.value,
      notes: edgeCaseData.workoutData.notes,
    };

    logProgressMutation.mutate(progressData, {
      onSuccess: () => {
        // Then update the goal's target value
        const updateData: UpdateGoalRequest = {
          targetValue: newTarget,
        };

        updateGoalMutation.mutate({ id: edgeCaseData.goal.id, data: updateData }, {
          onSuccess: () => {
            toast({
              title: "New Target Set! 🎉",
              description: `Your new target is ${newTarget} ${edgeCaseData.goal.unit}`,
            });
            setShowNewTargetDialog(false);
            setEdgeCaseData(null);
          }
        });
      }
    });
  };

  // Handle keeping current target
  const handleKeepTarget = () => {
    setShowNewTargetDialog(false);
    setEdgeCaseData(null);
  };


  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-regular">Set targets and track your fitness journey</h1>
        </div>
        <Button
          onClick={() => setShowAddGoal(true)}
          data-testid="goals-add-button"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>


      {/* Error State */}
      {(goalsError || exercisesError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {goalsError?.message || exercisesError?.message || 'Failed to load data'}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {(goalsLoading || exercisesLoading) && <GoalsSkeleton />}

      {/* Goals Grid */}
      {!goalsLoading && !exercisesLoading && goals && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-muted-foreground">
                <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No goals found</p>
                <p className="text-sm">
                  Start by creating your first fitness goal
                </p>
              </div>
            </div>
          ) : (
            goals.map((goal) => {
              // Filter progress data for this specific exercise
              const progressForExercise = allProgress?.filter(
                progress => progress.exerciseId === goal.exerciseId
              );

              return (
                <GoalCard
                  key={goal.id}
                  {...convertGoalForCard(goal)}
                  progressData={progressForExercise}
                  onEdit={handleEditGoal}
                  onAddProgress={handleAddProgress}
                />
              );
            })
          )}
        </div>
      )}


      {/* Dialogs */}
      <AddGoalDialog
        open={showAddGoal}
        onOpenChange={setShowAddGoal}
        exercises={exercises || []}
        onSubmit={handleAddGoal}
      />

      <EditGoalDialog
        open={showEditGoal}
        onOpenChange={(open) => {
          setShowEditGoal(open);
          if (!open) setSelectedGoalForEdit(null);
        }}
        goal={selectedGoalForEdit && selectedGoalForEdit.exercise ? {
          id: selectedGoalForEdit.id,
          exerciseName: selectedGoalForEdit.exercise.name,
          startingValue: selectedGoalForEdit.startingValue,
          currentValue: selectedGoalForEdit.currentValue,
          targetValue: selectedGoalForEdit.targetValue,
          unit: selectedGoalForEdit.unit || 'units',
          targetDate: dateUtils.formatForInput(selectedGoalForEdit.targetDate)
        } : null}
        exercises={exercises || []}
        onSubmit={handleUpdateGoal}
        onDelete={handleDeleteGoal}
      />

      <AddWorkoutDialog
        open={showAddWorkout}
        onOpenChange={(open) => {
          setShowAddWorkout(open);
          if (!open) setSelectedExerciseId(undefined);
        }}
        exercises={exercises || []}
        preselectedExerciseId={selectedExerciseId}
        onSubmit={handleAddWorkout}
      />

      {/* Edge Case Dialogs */}
      {edgeCaseData && (
        <>
          <ResetBaselineDialog
            open={showResetBaselineDialog}
            onOpenChange={setShowResetBaselineDialog}
            exerciseName={edgeCaseData.goal.exercise?.name || 'Unknown Exercise'}
            currentBaseline={edgeCaseData.goal.startingValue}
            newValue={edgeCaseData.newValue}
            unit={edgeCaseData.goal.unit || 'units'}
            onResetBaseline={handleResetBaseline}
            onKeepBaseline={handleKeepBaseline}
          />

          <NewTargetDialog
            open={showNewTargetDialog}
            onOpenChange={setShowNewTargetDialog}
            exerciseName={edgeCaseData.goal.exercise?.name || 'Unknown Exercise'}
            achievedValue={edgeCaseData.newValue}
            currentTarget={edgeCaseData.goal.targetValue}
            unit={edgeCaseData.goal.unit || 'units'}
            onSetNewTarget={handleSetNewTarget}
            onKeepTarget={handleKeepTarget}
          />
        </>
      )}
    </div>
  );
}