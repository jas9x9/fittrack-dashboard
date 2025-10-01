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
import { PartyPopper } from "lucide-react";

interface NewTargetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseName: string;
  achievedValue: number;
  currentTarget: number;
  unit: string;
  onSetNewTarget: (newTarget: number) => void;
  onKeepTarget: () => void;
}

export function NewTargetDialog({
  open,
  onOpenChange,
  exerciseName,
  achievedValue,
  currentTarget,
  unit,
  onSetNewTarget,
  onKeepTarget,
}: NewTargetDialogProps) {
  // Suggest 10% increase over achieved value
  const suggestedTarget = Math.ceil(achievedValue * 1.1);
  const [newTarget, setNewTarget] = useState(suggestedTarget.toString());
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const targetValue = parseFloat(newTarget);

    if (!newTarget || isNaN(targetValue)) {
      setError("Please enter a valid target value");
      return;
    }

    if (targetValue <= achievedValue) {
      setError(`Target must be greater than ${achievedValue} ${unit}`);
      return;
    }

    onSetNewTarget(targetValue);
    setError("");
  };

  const handleKeep = () => {
    onKeepTarget();
    setError("");
    setNewTarget(suggestedTarget.toString());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <PartyPopper className="h-5 w-5 text-primary" />
            <DialogTitle>Congratulations! 🎉</DialogTitle>
          </div>
          <DialogDescription className="space-y-2">
            <p>
              You've reached your {exerciseName} target of{" "}
              <span className="font-semibold">{currentTarget} {unit}</span>!
            </p>
            <p>
              You achieved <span className="font-semibold">{achievedValue} {unit}</span>.
              Ready to set a new challenge?
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="newTarget">New Target</Label>
            <div className="flex items-center gap-2">
              <Input
                id="newTarget"
                type="number"
                value={newTarget}
                onChange={(e) => {
                  setNewTarget(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Enter new target"
                className={`flex-1 ${error ? "border-red-500" : ""}`}
                data-testid="input-new-target"
              />
              <span className="text-sm text-muted-foreground w-16">{unit}</span>
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Suggested: {suggestedTarget} {unit} (+10%)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleKeep}
            data-testid="button-keep-target"
          >
            Keep Current Target
          </Button>
          <Button
            onClick={handleSubmit}
            data-testid="button-set-new-target"
          >
            Set New Target
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
