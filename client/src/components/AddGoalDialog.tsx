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
    targetValue: number;
    targetDate: Date;
    customExercise?: {
      name: string;
      unit: string;
      description?: string;
    };
  }) => void;
}

export function AddGoalDialog({ open, onOpenChange, exercises, onSubmit }: AddGoalDialogProps) {
  const [exerciseId, setExerciseId] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [targetDate, setTargetDate] = useState<Date>();
  const [isCustomExercise, setIsCustomExercise] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState("");
  const [customExerciseUnit, setCustomExerciseUnit] = useState("");
  const [customExerciseDescription, setCustomExerciseDescription] = useState("");

  const selectedExercise = exercises.find(ex => ex.id === exerciseId);

  const handleExerciseChange = (value: string) => {
    if (value === "add-new") {
      setIsCustomExercise(true);
      setExerciseId("");
    } else {
      setIsCustomExercise(false);
      setExerciseId(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isCustomExercise) {
      if (!customExerciseName || !customExerciseUnit || !targetValue || !targetDate) return;
      
      // For custom exercises, create a temporary ID
      const customExerciseId = `custom-${Date.now()}`;
      
      onSubmit({
        exerciseId: customExerciseId,
        targetValue: parseFloat(targetValue),
        targetDate,
        customExercise: {
          name: customExerciseName,
          unit: customExerciseUnit,
          description: customExerciseDescription
        }
      });
    } else {
      if (!exerciseId || !targetValue || !targetDate) return;
      
      onSubmit({
        exerciseId,
        targetValue: parseFloat(targetValue),
        targetDate,
      });
    }

    // Reset form
    setExerciseId("");
    setTargetValue("");
    setTargetDate(undefined);
    setIsCustomExercise(false);
    setCustomExerciseName("");
    setCustomExerciseUnit("");
    setCustomExerciseDescription("");
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
            <Label htmlFor="exercise">Exercise</Label>
            <Select value={isCustomExercise ? "add-new" : exerciseId} onValueChange={handleExerciseChange}>
              <SelectTrigger data-testid="select-exercise">
                <SelectValue placeholder="Select an exercise" />
              </SelectTrigger>
              <SelectContent>
                {exercises.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    <span className="text-foreground">{exercise.name}</span>
                  </SelectItem>
                ))}
                <SelectItem value="add-new">
                  <span className="text-foreground">Add New Exercise...</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isCustomExercise && (
            <>
              <div className="space-y-2">
                <Label htmlFor="customExerciseName">Exercise Name</Label>
                <Input
                  id="customExerciseName"
                  placeholder="Enter exercise name"
                  value={customExerciseName}
                  onChange={(e) => setCustomExerciseName(e.target.value)}
                  data-testid="input-custom-exercise-name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customExerciseUnit">Unit</Label>
                <Select value={customExerciseUnit} onValueChange={setCustomExerciseUnit}>
                  <SelectTrigger data-testid="select-custom-unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lbs">
                      <span className="text-foreground">lbs</span>
                    </SelectItem>
                    <SelectItem value="kg">
                      <span className="text-foreground">kg</span>
                    </SelectItem>
                    <SelectItem value="reps">
                      <span className="text-foreground">reps</span>
                    </SelectItem>
                    <SelectItem value="miles">
                      <span className="text-foreground">miles</span>
                    </SelectItem>
                    <SelectItem value="km">
                      <span className="text-foreground">km</span>
                    </SelectItem>
                    <SelectItem value="minutes">
                      <span className="text-foreground">minutes</span>
                    </SelectItem>
                    <SelectItem value="seconds">
                      <span className="text-foreground">seconds</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customExerciseDescription">Description (Optional)</Label>
                <Textarea
                  id="customExerciseDescription"
                  placeholder="Enter exercise description"
                  value={customExerciseDescription}
                  onChange={(e) => setCustomExerciseDescription(e.target.value)}
                  data-testid="textarea-custom-exercise-description"
                  rows={2}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="targetValue">
              Target Value {(selectedExercise && `(${selectedExercise.unit})`) || (isCustomExercise && customExerciseUnit && `(${customExerciseUnit})`)}
            </Label>
            <Input
              id="targetValue"
              type="number"
              placeholder="Enter target value"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              data-testid="input-target-value"
              required
            />
            {selectedExercise?.description && (
              <p className="text-xs text-muted-foreground">
                {selectedExercise.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Target Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
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
                  onSelect={setTargetDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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