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
  category: string;
}

interface EditGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  onSubmit: (goalId: string, updates: {
    exerciseName: string;
    targetValue: number;
    unit: string;
    targetDate: Date;
  }) => void;
}

export function EditGoalDialog({ open, onOpenChange, goal, onSubmit }: EditGoalDialogProps) {
  const [exerciseName, setExerciseName] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("KGs");
  const [targetDate, setTargetDate] = useState<Date>();

  // Populate form when goal changes
  useEffect(() => {
    if (goal) {
      setExerciseName(goal.exerciseName);
      setTargetValue(goal.targetValue.toString());
      setUnit("KGs"); // Default to KGs as requested
      setTargetDate(new Date(goal.targetDate));
    }
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal || !exerciseName || !targetValue || !unit || !targetDate) return;

    onSubmit(goal.id, {
      exerciseName,
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
          {/* Exercise Name */}
          <div className="space-y-2">
            <Label htmlFor="exerciseName">Exercise name</Label>
            <Input
              id="exerciseName"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              placeholder="Enter exercise name"
              data-testid="input-exercise-name"
            />
          </div>

          {/* Target */}
          <div className="space-y-2">
            <Label htmlFor="targetValue">Target</Label>
            <Input
              id="targetValue"
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="Enter target value"
              data-testid="input-target-value"
            />
          </div>

          {/* Unit */}
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger data-testid="select-unit">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KGs">KGs</SelectItem>
                <SelectItem value="Reps">Reps</SelectItem>
                <SelectItem value="KMs">KMs</SelectItem>
              </SelectContent>
            </Select>
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
              disabled={!exerciseName || !targetValue || !unit || !targetDate}
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