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
import { TrendingDown } from "lucide-react";

interface ResetBaselineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseName: string;
  currentBaseline: number;
  newValue: number;
  unit: string;
  onResetBaseline: () => void;
  onKeepBaseline: () => void;
}

export function ResetBaselineDialog({
  open,
  onOpenChange,
  exerciseName,
  currentBaseline,
  newValue,
  unit,
  onResetBaseline,
  onKeepBaseline,
}: ResetBaselineDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            <AlertDialogTitle>Performance Decreased</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <p>
              Your {exerciseName} performance has dropped below your starting value from{" "}
              <span className="font-semibold">{currentBaseline} {unit}</span> to{" "}
              <span className="font-semibold">{newValue} {unit}</span>.
            </p>
            <p>
              Your baseline will be reset to <span className="font-semibold">{newValue} {unit}</span> to
              reflect your current fitness level. This will recalculate your progress from this new starting point.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onKeepBaseline}
            data-testid="button-keep-baseline"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onResetBaseline}
            data-testid="button-reset-baseline"
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
