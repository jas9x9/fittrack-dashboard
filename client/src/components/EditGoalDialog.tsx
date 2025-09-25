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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface Goal {
  id: string;
  exerciseName: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  targetDate: string;
}

interface Exercise {
  id: string;
  name: string;
  unit: string;
  description?: string;
}

interface EditGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  exercises: Exercise[];
  onSubmit: (goalId: string, updates: {
    exerciseName: string;
    targetValue: number;
    unit: string;
    targetDate: Date;
  }) => void;
}

export function EditGoalDialog({ open, onOpenChange, goal, exercises, onSubmit }: EditGoalDialogProps) {
  const [exerciseId, setExerciseId] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("KGs");
  const [targetDate, setTargetDate] = useState<Date>();

  const selectedExercise = exercises.find(ex => ex.id === exerciseId);

  // Populate form when goal changes
  useEffect(() => {
    if (goal) {
      // Find the exercise ID based on the exercise name
      const exercise = exercises.find(ex => ex.name === goal.exerciseName);
      setExerciseId(exercise?.id || "");
      setTargetValue(goal.targetValue.toString());
      setUnit("KGs"); // Default to KGs as requested
      setTargetDate(new Date(goal.targetDate));
    }
  }, [goal, exercises]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal || !exerciseId || !targetValue || !unit || !targetDate) return;

    const selectedExercise = exercises.find(ex => ex.id === exerciseId);
    if (!selectedExercise) return;

    onSubmit(goal.id, {
      exerciseName: selectedExercise.name,
      targetValue: parseFloat(targetValue),
      unit,
      targetDate,
    });

    onOpenChange(false);
  };

  if (!goal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Goal</DialogTitle>
          <DialogDescription>
            Update your fitness goal details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Exercise */}
          <div className="space-y-2">
            <Label htmlFor="exercise">Exercise</Label>
            <Select value={exerciseId} onValueChange={setExerciseId}>
              <SelectTrigger data-testid="select-exercise">
                <SelectValue placeholder="Select an exercise" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {exercises.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id} className="text-foreground">
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target and Unit (same row) */}
          <div className="space-y-2">
            <Label htmlFor="targetValue">Target</Label>
            <div className="flex items-center gap-2">
              <Input
                id="targetValue"
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="Enter target value"
                className="flex-1"
                data-testid="input-target-value"
              />
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="w-24" data-testid="select-unit">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KGs">
                    <span className="text-foreground">KGs</span>
                  </SelectItem>
                  <SelectItem value="Reps">
                    <span className="text-foreground">Reps</span>
                  </SelectItem>
                  <SelectItem value="KMs">
                    <span className="text-foreground">KMs</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label>Deadline</Label>
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
              disabled={!exerciseId || !targetValue || !unit || !targetDate}
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