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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface Exercise {
  id: string;
  name: string;
}

interface AddWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercises: Exercise[];
  preselectedExerciseId: string; // Now required - dialog always logs workout for a specific exercise
  onSubmit: (workout: {
    exerciseId: string;
    value: number;
    date: Date;
    notes?: string;
  }) => void;
}

export function AddWorkoutDialog({
  open,
  onOpenChange,
  exercises,
  preselectedExerciseId,
  onSubmit
}: AddWorkoutDialogProps) {
  const [value, setValue] = useState("");
  const [sessionDate, setSessionDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");

  const selectedExercise = exercises.find(ex => ex.id === preselectedExerciseId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value) return;

    onSubmit({
      exerciseId: preselectedExerciseId,
      value: parseFloat(value),
      date: sessionDate,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setValue("");
    setSessionDate(new Date());
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {selectedExercise ? `Log Workout - ${selectedExercise.name}` : "Log Workout"}
          </DialogTitle>
          <DialogDescription>
            Record your performance for this exercise.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="value">
              Performance Value
            </Label>
            <Input
              id="value"
              type="number"
              placeholder="Enter your performance"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              data-testid="input-workout-value"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Workout Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  data-testid="button-workout-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(sessionDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={sessionDate}
                  onSelect={(date) => date && setSessionDate(date)}
                  disabled={(date) => date > new Date()}
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
              data-testid="button-cancel-workout"
            >
              Cancel
            </Button>
            <Button type="submit" data-testid="button-log-workout">
              Log Workout
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
