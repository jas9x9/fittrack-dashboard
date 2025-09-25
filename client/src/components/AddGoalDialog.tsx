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
    unit: string;
    targetDate: Date;
  }) => void;
}

export function AddGoalDialog({ open, onOpenChange, exercises, onSubmit }: AddGoalDialogProps) {
  const [exerciseId, setExerciseId] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("KGs");
  const [targetDate, setTargetDate] = useState<Date>();

  const selectedExercise = exercises.find(ex => ex.id === exerciseId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseId || !targetValue || !unit || !targetDate) return;

    onSubmit({
      exerciseId,
      targetValue: parseFloat(targetValue),
      unit,
      targetDate,
    });

    // Reset form
    setExerciseId("");
    setTargetValue("");
    setUnit("KGs");
    setTargetDate(undefined);
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