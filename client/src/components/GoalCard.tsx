import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { WorkoutChart } from "./WorkoutChart";
import { Target, Calendar, Edit, Plus, Sparkles } from "lucide-react";

interface GoalCardProps {
  id: string;
  exerciseName: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  targetDate: string;
  onEdit?: (id: string) => void;
  onAddProgress?: (id: string) => void;
  className?: string;
}

// Generate mock chart data for demonstration
function generateMockData(exerciseName: string, currentValue: number) {
  const baseValue = Math.max(currentValue - 20, currentValue * 0.7);
  const dataPoints = [];
  
  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (5 - i) * 3);
    const variation = Math.random() * 10 - 5;
    const value = Math.round(baseValue + (currentValue - baseValue) * (i / 5) + variation);
    
    dataPoints.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.max(value, baseValue * 0.8)
    });
  }
  
  return dataPoints;
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
  className = ""
}: GoalCardProps) {
  const progress = Math.min((currentValue / targetValue) * 100, 100);
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
              <Sparkles className="h-4 w-4 text-primary" data-testid="icon-goal-achieved" />
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
          <WorkoutChart 
            data={generateMockData(exerciseName, currentValue)} 
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