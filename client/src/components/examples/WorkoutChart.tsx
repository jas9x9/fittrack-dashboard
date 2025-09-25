import { WorkoutChart } from '../WorkoutChart';

const mockData = [
  { date: 'Jan 1', value: 135, target: 150 },
  { date: 'Jan 8', value: 140, target: 150 },
  { date: 'Jan 15', value: 145, target: 150 },
  { date: 'Jan 22', value: 142, target: 150 },
  { date: 'Jan 29', value: 148, target: 150 },
  { date: 'Feb 5', value: 150, target: 150 },
];

export default function WorkoutChartExample() {
  return (
    <div className="w-full max-w-2xl">
      <WorkoutChart 
        data={mockData}
        title="Bench Press Progress"
        unit="lbs"
        className="bg-card border rounded-lg"
      />
    </div>
  );
}