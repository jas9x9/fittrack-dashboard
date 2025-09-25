import { useState } from 'react';
import { AddGoalDialog } from '../AddGoalDialog';
import { Button } from '@/components/ui/button';

const mockExercises = [
  { id: '1', name: 'Bench Press', category: 'Strength', unit: 'lbs', description: 'Chest and tricep strength exercise' },
  { id: '2', name: 'Squats', category: 'Strength', unit: 'lbs', description: 'Lower body compound movement' },
  { id: '3', name: 'Running', category: 'Cardio', unit: 'miles', description: 'Cardiovascular endurance' },
  { id: '4', name: 'Push-ups', category: 'Strength', unit: 'reps', description: 'Bodyweight upper body exercise' },
];

export default function AddGoalDialogExample() {
  const [open, setOpen] = useState(false);

  const handleSubmit = (goal: any) => {
    console.log('New goal created:', goal);
  };

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)} data-testid="open-add-goal">
        Open Add Goal Dialog
      </Button>
      <AddGoalDialog
        open={open}
        onOpenChange={setOpen}
        exercises={mockExercises}
        onSubmit={handleSubmit}
      />
    </div>
  );
}