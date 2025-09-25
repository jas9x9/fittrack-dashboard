import { useState } from "react";
import { WorkoutSessionList } from "@/components/WorkoutSessionList";
import { WorkoutChart } from "@/components/WorkoutChart";
import { AddWorkoutDialog } from "@/components/AddWorkoutDialog";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, Activity, Timer, Zap } from "lucide-react";

// TODO: Remove mock data when implementing real backend
const mockExercises = [
  { id: '1', name: 'Bench Press', unit: 'lbs', description: 'Chest and tricep strength exercise' },
  { id: '2', name: 'Squats', unit: 'lbs', description: 'Lower body compound movement' },
  { id: '3', name: 'Running', unit: 'miles', description: 'Cardiovascular endurance' },
  { id: '4', name: 'Push-ups', unit: 'reps', description: 'Bodyweight upper body exercise' },
  { id: '5', name: 'Deadlift', unit: 'lbs', description: 'Full body compound lift' },
];

const mockSessions = [
  {
    id: '1',
    exerciseName: 'Bench Press',
    value: 145,
    unit: 'lbs',
    date: '2024-01-15',

    notes: 'Felt strong today',
    change: 3.6
  },
  {
    id: '2',
    exerciseName: 'Running',
    value: 4.2,
    unit: 'miles',
    date: '2024-01-14',

    change: -2.3
  },
  {
    id: '3',
    exerciseName: 'Push-ups',
    value: 45,
    unit: 'reps',
    date: '2024-01-13',

    notes: 'Good form',
    change: 7.1
  },
  {
    id: '4',
    exerciseName: 'Squats',
    value: 85,
    unit: 'lbs',
    date: '2024-01-12',

    notes: 'New personal record',
    change: 12.5
  },
  {
    id: '5',
    exerciseName: 'Running',
    value: 3.8,
    unit: 'miles',
    date: '2024-01-11',

    change: 5.2
  },
  {
    id: '6',
    exerciseName: 'Bench Press',
    value: 140,
    unit: 'lbs',
    date: '2024-01-10',

    change: 0
  }
];

const mockChartData = [
  { date: 'Jan 1', value: 135 },
  { date: 'Jan 3', value: 138 },
  { date: 'Jan 6', value: 140 },
  { date: 'Jan 10', value: 140 },
  { date: 'Jan 13', value: 142 },
  { date: 'Jan 15', value: 145 },
];

export default function Workouts() {
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercise, setSelectedExercise] = useState("all");

  const handleAddWorkout = (workout: any) => {
    console.log('New workout logged:', workout);
    // TODO: Implement add workout functionality
  };

  const filteredSessions = mockSessions.filter(session => {
    const matchesSearch = session.exerciseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = true;
    const matchesExercise = selectedExercise === "all" || session.exerciseName === selectedExercise;
    return matchesSearch && matchesCategory && matchesExercise;
  });

  const exercises = Array.from(new Set(mockSessions.map(session => session.exerciseName)));

  const totalSessions = mockSessions.length;
  const thisWeekSessions = mockSessions.filter(session => {
    const sessionDate = new Date(session.date);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return sessionDate >= oneWeekAgo;
  }).length;

  const averageImprovement = mockSessions
    .filter(s => s.change !== undefined && s.change > 0)
    .reduce((acc, s) => acc + (s.change || 0), 0) / 
    Math.max(mockSessions.filter(s => s.change !== undefined && s.change > 0).length, 1);

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workouts</h1>
          <p className="text-muted-foreground">
            Log and track all your workout sessions
          </p>
        </div>
        <Button
          onClick={() => setShowAddWorkout(true)}
          data-testid="workouts-add-button"
        >
          <Plus className="h-4 w-4 mr-2" />
          Log Workout
        </Button>
      </div>

      {/* Workout Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Sessions"
          value={totalSessions.toString()}
          icon={Activity}
          description="All time workout sessions"
        />
        <StatCard
          title="This Week"
          value={thisWeekSessions.toString()}
          change={`+${thisWeekSessions - 2} from last week`}
          changeType="positive"
          icon={Timer}
          description="Sessions completed this week"
        />
        <StatCard
          title="Avg Improvement"
          value={`${averageImprovement.toFixed(1)}%`}
          change="Great progress!"
          changeType="positive"
          icon={Zap}
          description="Average performance increase"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search workouts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="search-workouts"
          />
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedExercise} onValueChange={setSelectedExercise}>
            <SelectTrigger className="w-[140px]" data-testid="filter-exercise">
              <SelectValue placeholder="Exercise" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All exercises</SelectItem>
              {exercises.map((exercise) => (
                <SelectItem key={exercise} value={exercise}>
                  {exercise}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-card border rounded-lg">
        <WorkoutChart 
          data={mockChartData}
          title="Bench Press Progress"
          unit="lbs"
        />
      </div>

      {/* Workout Sessions List */}
      <WorkoutSessionList
        sessions={filteredSessions}
        title="Workout History"
        onAddSession={() => setShowAddWorkout(true)}
      />

      {filteredSessions.length === 0 && (searchTerm || selectedExercise !== "all") && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No workouts found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        </div>
      )}

      {/* Add Workout Dialog */}
      <AddWorkoutDialog
        open={showAddWorkout}
        onOpenChange={setShowAddWorkout}
        exercises={mockExercises}
        onSubmit={handleAddWorkout}
      />
    </div>
  );
}