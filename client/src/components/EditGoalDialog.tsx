import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Target, Calendar as CalendarLucide } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Goal {
  id: string;
  exerciseName: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  targetDate: string;
  category: string;
}

interface EditGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  onSubmit: (goalId: string, updates: {
    targetValue: number;
    targetDate: Date;
  }) => void;
}

export function EditGoalDialog({ open, onOpenChange, goal, onSubmit }: EditGoalDialogProps) {
  const [targetValue, setTargetValue] = useState("");
  const [targetDate, setTargetDate] = useState<Date>();

  // Populate form when goal changes
  useEffect(() => {
    if (goal) {
      setTargetValue(goal.targetValue.toString());
      setTargetDate(new Date(goal.targetDate));
    }
  }, [goal]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal || !targetValue || !targetDate) return;

    onSubmit(goal.id, {
      targetValue: parseFloat(targetValue),
      targetDate,
    });

    onOpenChange(false);
  };

  const progressPercentage = goal ? Math.min((goal.currentValue / goal.targetValue) * 100, 100) : 0;

  if (!goal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit Goal: {goal.exerciseName}
            <Badge className={getCategoryColor(goal.category)} variant="secondary">
              {goal.category}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Update your target value and deadline for this fitness goal.
          </DialogDescription>
        </DialogHeader>

        {/* Current Progress Display */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Current Progress</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-lg">
                {goal.currentValue} / {goal.targetValue} {goal.unit}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{Math.round(progressPercentage)}% Complete</div>
              <div className="text-xs text-muted-foreground">
                {goal.currentValue >= goal.targetValue ? "Goal Achieved!" : "In Progress"}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Exercise Info (Read-only) */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Exercise (Cannot be changed)</Label>
            <div className="p-3 bg-muted/30 rounded-md">
              <div className="font-medium">{goal.exerciseName}</div>
              <div className="text-sm text-muted-foreground">Unit: {goal.unit}</div>
            </div>
          </div>

          {/* Current Value (Read-only) */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Current Achievement (Auto-tracked)</Label>
            <div className="p-3 bg-muted/30 rounded-md">
              <div className="font-mono text-lg">{goal.currentValue} {goal.unit}</div>
              <div className="text-sm text-muted-foreground">
                Updated automatically when you log workouts
              </div>
            </div>
          </div>

          {/* Target Value (Editable) */}
          <div className="space-y-2">
            <Label htmlFor="targetValue" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Target Value
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="targetValue"
                type="number"
                step="0.1"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="Enter target value"
                className="flex-1"
                data-testid="input-target-value"
              />
              <span className="text-sm text-muted-foreground min-w-fit">{goal.unit}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Set your goal target. Make it challenging but achievable!
            </div>
          </div>

          {/* Target Date (Editable) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarLucide className="h-4 w-4" />
              Target Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  data-testid="button-target-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {targetDate ? format(targetDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={targetDate}
                  onSelect={setTargetDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="text-xs text-muted-foreground">
              Choose a realistic deadline to achieve your target
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!targetValue || !targetDate}
              data-testid="button-save-goal"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}