import { useState } from "react";
import { StatCard } from "@/components/StatCard";
import { GoalCard } from "@/components/GoalCard";
import { WorkoutChart } from "@/components/WorkoutChart";
import { WorkoutSessionList } from "@/components/WorkoutSessionList";
import { AddGoalDialog } from "@/components/AddGoalDialog";
import { AddWorkoutDialog } from "@/components/AddWorkoutDialog";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  Trophy, 
  TrendingUp, 
  Calendar,
  Plus 
} from "lucide-react";

// TODO: Remove mock data when implementing real backend
const mockExercises = [
  { id: '1', name: 'Bench Press', unit: 'lbs', description: 'Chest and tricep strength exercise' },
  { id: '2', name: 'Squats', unit: 'lbs', description: 'Lower body compound movement' },
  { id: '3', name: 'Running', unit: 'miles', description: 'Cardiovascular endurance' },
  { id: '4', name: 'Push-ups', unit: 'reps', description: 'Bodyweight upper body exercise' },
  { id: '5', name: 'Deadlift', unit: 'lbs', description: 'Full body compound lift' },
];

const mockGoals = [
  {
    id: '1',
    exerciseName: 'Bench Press',
    currentValue: 140,
    targetValue: 150,
    unit: 'lbs',
    targetDate: '2024-12-31',

  },
  {
    id: '2',
    exerciseName: 'Running',
    currentValue: 4.2,
    targetValue: 5.0,
    unit: 'miles',
    targetDate: '2024-11-15',

  },
  {
    id: '3',
    exerciseName: 'Push-ups',
    currentValue: 50,
    targetValue: 50,
    unit: 'reps',
    targetDate: '2024-10-01',

  }
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
];

const mockChartData = [
  { date: 'Jan 1', value: 135, target: 150 },
  { date: 'Jan 8', value: 140, target: 150 },
  { date: 'Jan 15', value: 145, target: 150 },
  { date: 'Jan 22', value: 142, target: 150 },
  { date: 'Jan 29', value: 148, target: 150 },
  { date: 'Feb 5', value: 150, target: 150 },
];

export default function Dashboard() {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>();

  const handleEditGoal = (id: string) => {
    console.log('Edit goal:', id);
    // TODO: Implement edit goal functionality
  };

  const handleAddProgress = (goalId: string) => {
    const goal = mockGoals.find(g => g.id === goalId);
    if (goal) {
      const exercise = mockExercises.find(e => e.name === goal.exerciseName);
      setSelectedExerciseId(exercise?.id);
      setShowAddWorkout(true);
    }
  };

  const handleAddGoal = (goal: any) => {
    console.log('New goal created:', goal);
    // TODO: Implement add goal functionality
  };

  const handleAddWorkout = (workout: any) => {
    console.log('New workout logged:', workout);
    // TODO: Implement add workout functionality
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your fitness progress and achieve your goals
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAddGoal(true)}
            data-testid="dashboard-add-goal"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
          <Button
            onClick={() => setShowAddWorkout(true)}
            data-testid="dashboard-add-workout"
          >
            <Plus className="h-4 w-4 mr-2" />
            Log Workout
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Goals"
          value="3"
          change="+1 this month"
          changeType="positive"
          icon={Target}
          description="Goals currently being tracked"
        />
        <StatCard
          title="Completed Goals"
          value="1"
          change="Push-ups mastered!"
          changeType="positive"
          icon={Trophy}
          description="Goals achieved this year"
        />
        <StatCard
          title="Weekly Sessions"
          value="5"
          change="+2 from last week"
          changeType="positive"
          icon={TrendingUp}
          description="Workout sessions this week"
        />
        <StatCard
          title="Streak"
          value="7 days"
          change="Keep it up!"
          changeType="positive"
          icon={Calendar}
          description="Current workout streak"
        />
      </div>

      {/* Goals Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Goals</h2>
          <Button
            variant="ghost"
            onClick={() => setShowAddGoal(true)}
            data-testid="goals-section-add"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              {...goal}
              onEdit={handleEditGoal}
              onAddProgress={handleAddProgress}
            />
          ))}
        </div>
      </div>

      {/* Progress Chart and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg">
          <WorkoutChart 
            data={mockChartData}
            title="Bench Press Progress"
            unit="lbs"
          />
        </div>
        <WorkoutSessionList
          sessions={mockSessions}
          title="Recent Activity"
          onAddSession={() => setShowAddWorkout(true)}
        />
      </div>

      {/* Dialogs */}
      <AddGoalDialog
        open={showAddGoal}
        onOpenChange={setShowAddGoal}
        exercises={mockExercises}
        onSubmit={handleAddGoal}
      />

      <AddWorkoutDialog
        open={showAddWorkout}
        onOpenChange={(open) => {
          setShowAddWorkout(open);
          if (!open) setSelectedExerciseId(undefined);
        }}
        exercises={mockExercises}
        preselectedExerciseId={selectedExerciseId}
        onSubmit={handleAddWorkout}
      />
    </div>
  );
}