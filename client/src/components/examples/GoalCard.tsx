import { GoalCard } from '../GoalCard';

export default function GoalCardExample() {
  const handleEdit = (id: string) => {
    console.log('Edit goal:', id);
  };

  const handleAddProgress = (id: string) => {
    console.log('Add progress for goal:', id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 max-w-4xl">
      <GoalCard
        id="1"
        exerciseName="Bench Press"
        currentValue={140}
        targetValue={150}
        unit="lbs"
        targetDate="2024-12-31"
        category="Strength"
        onEdit={handleEdit}
        onAddProgress={handleAddProgress}
      />
      <GoalCard
        id="2"
        exerciseName="Running"
        currentValue={4.2}
        targetValue={5.0}
        unit="miles"
        targetDate="2024-11-15"
        category="Cardio"
        onEdit={handleEdit}
        onAddProgress={handleAddProgress}
      />
      <GoalCard
        id="3"
        exerciseName="Push-ups"
        currentValue={50}
        targetValue={50}
        unit="reps"
        targetDate="2024-10-01"
        category="Strength"
        onEdit={handleEdit}
        onAddProgress={handleAddProgress}
      />
    </div>
  );
}