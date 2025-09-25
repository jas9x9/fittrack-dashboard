import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "./ProgressRing";
import { Target, TrendingUp, Calendar, Edit, Plus } from "lucide-react";

interface GoalCardProps {
  id: string;
  exerciseName: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  targetDate: string;
  category: string;
  onEdit?: (id: string) => void;
  onAddProgress?: (id: string) => void;
  className?: string;
}

export function GoalCard({
  id,
  exerciseName,
  currentValue,
  targetValue,
  unit,
  targetDate,
  category,
  onEdit,
  onAddProgress,
  className = ""
}: GoalCardProps) {
  const progress = Math.min((currentValue / targetValue) * 100, 100);
  const isCompleted = currentValue >= targetValue;
  const daysRemaining = Math.ceil((new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "strength":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "cardio":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "flexibility":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <Card className={`hover-elevate ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{exerciseName}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge className={getCategoryColor(category)} variant="secondary">
            {category}
          </Badge>
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-mono">
                {currentValue} / {targetValue} {unit}
              </span>
            </div>
            <Progress value={progress} className="h-2 mb-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
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
          </div>
          <div className="ml-4">
            <ProgressRing progress={progress} size={60} strokeWidth={4} />
          </div>
        </div>
        
        {isCompleted && (
          <div className="bg-primary/10 border border-primary/20 rounded-md p-3 mb-3">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <TrendingUp className="h-4 w-4" />
              Goal Achieved! 🎉
            </div>
          </div>
        )}
        
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