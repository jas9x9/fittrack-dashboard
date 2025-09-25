import { useState } from 'react';
import { AddGoalDialog } from '../AddGoalDialog';
import { Button } from '@/components/ui/button';

const mockExercises = [
  { id: '1', name: 'Squats', unit: 'lbs', description: 'Lower body compound movement' },
  { id: '2', name: 'Deadlift', unit: 'lbs', description: 'Full body compound lift' },
  { id: '3', name: 'Bench Press', unit: 'lbs', description: 'Chest and tricep strength exercise' },
  { id: '4', name: 'Shoulder Press', unit: 'lbs', description: 'Overhead pressing movement' },
  { id: '5', name: 'Push Ups', unit: 'reps', description: 'Bodyweight upper body exercise' },
  { id: '6', name: 'Pull Ups', unit: 'reps', description: 'Bodyweight pulling exercise' },
  { id: '7', name: 'Running', unit: 'miles', description: 'Cardiovascular endurance' },
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