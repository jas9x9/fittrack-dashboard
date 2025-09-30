import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { WorkoutChart } from "./WorkoutChart";
import { Target, Calendar, Edit, Plus, PartyPopper } from "lucide-react";
import type { WorkoutProgress } from "@/api";

interface GoalCardProps {
  id: string;
  exerciseName: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  targetDate: string;
  onEdit?: (id: string) => void;
  onAddProgress?: (id: string) => void;
  progressData?: WorkoutProgress[];
  className?: string;
}

// Transform workout progress data into chart format
function formatProgressForChart(progressData: WorkoutProgress[] | undefined, currentValue: number) {
  // If no progress data, show single point with current value
  if (!progressData || progressData.length === 0) {
    return [{
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: currentValue
    }];
  }

  // Sort progress by date (oldest to newest) and limit to last 30 entries
  const sortedProgress = [...progressData]
    .sort((a, b) => a.progressDate.getTime() - b.progressDate.getTime())
    .slice(-30);

  // Transform to chart format
  return sortedProgress.map(progress => ({
    date: progress.progressDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: progress.value
  }));
}

export function GoalCard({
  id,
  exerciseName,
  currentValue,
  targetValue,
  unit,
  targetDate,
  onEdit,
  onAddProgress,
  progressData,
  className = ""
}: GoalCardProps) {
  // Calculate starting baseline from first workout entry
  // Create a sorted copy to avoid mutating original array
  const sortedProgress = progressData
    ? [...progressData].sort((a, b) => a.progressDate.getTime() - b.progressDate.getTime())
    : undefined;

  // Starting value = first workout logged, or current if no workouts yet
  const startingValue = sortedProgress?.[0]?.value ?? currentValue;

  // Progress calculation based on starting point
  const totalDistance = targetValue - startingValue;
  const progressMade = currentValue - startingValue;

  // Handle edge cases:
  // - If no distance to cover (already at or past target from start), show 100%
  // - If going backwards (currentValue < startingValue), show 0%
  // - Otherwise calculate percentage and cap at 100%
  let progress = 0;
  if (totalDistance <= 0) {
    progress = 100; // Already at or past target from the start
  } else if (progressMade < 0) {
    progress = 0; // Going backwards
  } else {
    progress = Math.min((progressMade / totalDistance) * 100, 100);
  }

  const isCompleted = currentValue >= targetValue;
  const daysRemaining = Math.ceil((new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));


  return (
    <Card className={`hover-elevate ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{exerciseName}</CardTitle>
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(id)}
            data-testid={`button-edit-goal-${id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-mono">
              {currentValue} / {targetValue} {unit}
            </span>
            {isCompleted && (
              <PartyPopper className="h-4 w-4 text-primary" data-testid="icon-goal-achieved" />
            )}
          </div>
          <Progress value={progress} className="h-2 mb-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {daysRemaining > 0 ? `${daysRemaining} days left` :
                 daysRemaining === 0 ? 'Due today' :
                 `${Math.abs(daysRemaining)} days overdue`}
              </span>
            </div>
            <span>{Math.round(progress)}% complete</span>
          </div>
          {startingValue !== currentValue && (
            <div className="text-xs text-muted-foreground mb-2">
              Started at {startingValue} {unit}
            </div>
          )}
          <WorkoutChart
            data={formatProgressForChart(progressData, currentValue)}
            title="Recent Progress"
            unit={unit}
            className="border-t pt-2"
          />
        </div>
        
        {onAddProgress && (
          <Button
            onClick={() => onAddProgress(id)}
            className="w-full"
            size="sm"
            data-testid={`button-add-progress-${id}`}
          >
            <Plus className="h-4 w-4 mr-2" />
            Log Progress
          </Button>
        )}
      </CardContent>
    </Card>
  );
}