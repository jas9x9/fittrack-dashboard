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
}

interface AddWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercises: Exercise[];
  preselectedExerciseId?: string;
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
  const [exerciseId, setExerciseId] = useState(preselectedExerciseId || "");
  const [value, setValue] = useState("");
  const [sessionDate, setSessionDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");

  const selectedExercise = exercises.find(ex => ex.id === exerciseId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseId || !value) return;

    onSubmit({
      exerciseId,
      value: parseFloat(value),
      date: sessionDate,
      notes: notes.trim() || undefined,
    });

    // Reset form
    if (!preselectedExerciseId) {
      setExerciseId("");
    }
    setValue("");
    setSessionDate(new Date());
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Workout Session</DialogTitle>
          <DialogDescription>
            Record your workout performance to track your progress over time.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exercise">Exercise</Label>
            <Select value={exerciseId} onValueChange={setExerciseId}>
              <SelectTrigger data-testid="select-workout-exercise">
                <SelectValue placeholder="Select an exercise" />
              </SelectTrigger>
              <SelectContent>
                {exercises.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    <span>{exercise.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about your workout..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              data-testid="textarea-workout-notes"
              rows={2}
            />
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