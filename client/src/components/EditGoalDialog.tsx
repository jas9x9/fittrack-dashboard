import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { CalendarIcon, Trash2 } from "lucide-react";
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
}

interface EditGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  exercises: Exercise[];
  onSubmit: (goalId: string, updates: {
    exerciseName: string;
    currentValue: number;
    targetValue: number;
    unit: string;
    targetDate: Date;
  }) => void;
  onDelete?: (goalId: string) => void;
}

export function EditGoalDialog({ open, onOpenChange, goal, exercises, onSubmit, onDelete }: EditGoalDialogProps) {
  const [exerciseId, setExerciseId] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("KGs");
  const [targetDate, setTargetDate] = useState<Date>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selectedExercise = exercises.find(ex => ex.id === exerciseId);

  // Populate form when goal changes
  useEffect(() => {
    if (goal) {
      // Find the exercise ID based on the exercise name
      const exercise = exercises.find(ex => ex.name === goal.exerciseName);
      setExerciseId(exercise?.id || "");
      setCurrentValue(goal.currentValue.toString());
      setTargetValue(goal.targetValue.toString());
      setUnit("KGs"); // Default to KGs as requested
      setTargetDate(new Date(goal.targetDate));
      setErrors({});
      setCalendarOpen(false);
    }
  }, [goal, exercises]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors: Record<string, string> = {};

    if (!exerciseId) newErrors.exerciseId = "Exercise is required";
    if (!currentValue) newErrors.currentValue = "Current value is required";
    if (!targetValue) newErrors.targetValue = "Target value is required";
    if (!targetDate) newErrors.targetDate = "Target date is required";

    if (currentValue && targetValue && parseFloat(currentValue) >= parseFloat(targetValue)) {
      newErrors.targetValue = "Target value must be greater than current value";
    }

    setErrors(newErrors);

    // If there are errors, don't submit
    if (Object.keys(newErrors).length > 0) return;

    if (!goal) return;

    const selectedExercise = exercises.find(ex => ex.id === exerciseId);
    if (!selectedExercise) return;

    if (!targetDate) return;

    onSubmit(goal.id, {
      exerciseName: selectedExercise.name,
      currentValue: parseFloat(currentValue),
      targetValue: parseFloat(targetValue),
      unit,
      targetDate,
    });

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!goal || !onDelete) return;
    onDelete(goal.id);
    setShowDeleteConfirm(false);
    onOpenChange(false);
  };

  if (!goal) return null;

  return (
    <>
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
            <Label htmlFor="exercise">Exercise <span className="text-red-500">*</span></Label>
            <Select value={exerciseId} onValueChange={(value) => {
              setExerciseId(value);
              if (errors.exerciseId) setErrors(prev => ({ ...prev, exerciseId: "" }));
            }}>
              <SelectTrigger data-testid="select-exercise" className={errors.exerciseId ? "border-red-500" : ""}>
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
            {errors.exerciseId && (
              <p className="text-sm text-red-500">{errors.exerciseId}</p>
            )}
          </div>

          {/* Current and Unit (same row) */}
          <div className="space-y-2">
            <Label htmlFor="currentValue">Current <span className="text-red-500">*</span></Label>
            <div className="flex items-center gap-2">
              <Input
                id="currentValue"
                type="number"
                value={currentValue}
                onChange={(e) => {
                  setCurrentValue(e.target.value);
                  if (errors.currentValue) setErrors(prev => ({ ...prev, currentValue: "" }));
                }}
                placeholder="Enter current value"
                className={`flex-1 ${errors.currentValue ? "border-red-500" : ""}`}
                data-testid="input-current-value"
              />
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="w-24" data-testid="select-current-unit">
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
            {errors.currentValue && (
              <p className="text-sm text-red-500">{errors.currentValue}</p>
            )}
          </div>

          {/* Target and Unit (same row) */}
          <div className="space-y-2">
            <Label htmlFor="targetValue">Target <span className="text-red-500">*</span></Label>
            <div className="flex items-center gap-2">
              <Input
                id="targetValue"
                type="number"
                value={targetValue}
                onChange={(e) => {
                  setTargetValue(e.target.value);
                  if (errors.targetValue) setErrors(prev => ({ ...prev, targetValue: "" }));
                }}
                placeholder="Enter target value"
                className={`flex-1 ${errors.targetValue ? "border-red-500" : ""}`}
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
            {errors.targetValue && (
              <p className="text-sm text-red-500">{errors.targetValue}</p>
            )}
          </div>

          {/* Target Date */}
          <div className="space-y-2">
            <Label>Target Date <span className="text-red-500">*</span></Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${errors.targetDate ? "border-red-500" : ""}`}
                  data-testid="button-target-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {targetDate ? format(targetDate, "PPP") : "Pick a target date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={targetDate}
                  onSelect={(date) => {
                    setTargetDate(date);
                    if (errors.targetDate) setErrors(prev => ({ ...prev, targetDate: "" }));
                    setCalendarOpen(false); // Close the calendar after selection
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.targetDate && (
              <p className="text-sm text-red-500">{errors.targetDate}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <div className="flex w-full justify-between items-center">
              {onDelete && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowDeleteConfirm(true)}
                  data-testid="button-delete-goal"
                  className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
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
                  data-testid="button-save-goal"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Goal?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this goal for {goal?.exerciseName}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="border [border-color:var(--button-outline)] shadow-xs active:shadow-none text-red-500 hover-elevate active-elevate-2 bg-transparent"
            data-testid="button-confirm-delete"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}