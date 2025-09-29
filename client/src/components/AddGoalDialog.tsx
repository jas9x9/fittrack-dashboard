import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface Exercise {
  id: string;
  name: string;
  unit: string;
  description?: string;
}

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercises: Exercise[];
  onSubmit: (goal: {
    exerciseId: string;
    currentValue: number;
    targetValue: number;
    unit: string;
    targetDate: Date;
  }) => void;
}

export function AddGoalDialog({ open, onOpenChange, exercises, onSubmit }: AddGoalDialogProps) {
  const [exerciseId, setExerciseId] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("KGs");
  const [targetDate, setTargetDate] = useState<Date>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calendarOpen, setCalendarOpen] = useState(false);

  const selectedExercise = exercises.find(ex => ex.id === exerciseId);

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

    if (!targetDate) return;

    onSubmit({
      exerciseId,
      currentValue: parseFloat(currentValue),
      targetValue: parseFloat(targetValue),
      unit,
      targetDate,
    });

    // Reset form
    setExerciseId("");
    setCurrentValue("");
    setTargetValue("");
    setUnit("KGs");
    setTargetDate(undefined);
    setErrors({});
    setCalendarOpen(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
          <DialogDescription>
            Set a target for your workout progress. You can track your improvement over time.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button type="submit" data-testid="button-create-goal">
              Create Goal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}