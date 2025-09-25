import { WorkoutSessionList } from '../WorkoutSessionList';

const mockSessions = [
  {
    id: '1',
    exerciseName: 'Bench Press',
    value: 145,
    unit: 'lbs',
    date: '2024-01-15',
    category: 'Strength',
    notes: 'Felt strong today',
    change: 3.6
  },
  {
    id: '2',
    exerciseName: 'Running',
    value: 4.2,
    unit: 'miles',
    date: '2024-01-14',
    category: 'Cardio',
    change: -2.3
  },
  {
    id: '3',
    exerciseName: 'Push-ups',
    value: 45,
    unit: 'reps',
    date: '2024-01-13',
    category: 'Strength',
    notes: 'Good form',
    change: 7.1
  },
];

export default function WorkoutSessionListExample() {
  const handleAddSession = () => {
    console.log('Add workout session triggered');
  };

  return (
    <div className="max-w-2xl p-4">
      <WorkoutSessionList
        sessions={mockSessions}
        onAddSession={handleAddSession}
      />
    </div>
  );
}