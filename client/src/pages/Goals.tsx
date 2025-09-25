import { useState } from "react";
import { GoalCard } from "@/components/GoalCard";
import { AddGoalDialog } from "@/components/AddGoalDialog";
import { AddWorkoutDialog } from "@/components/AddWorkoutDialog";
import { EditGoalDialog } from "@/components/EditGoalDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Filter } from "lucide-react";

// TODO: Remove mock data when implementing real backend
const mockExercises = [
  { id: '1', name: 'Bench Press', category: 'Strength', unit: 'lbs', description: 'Chest and tricep strength exercise' },
  { id: '2', name: 'Squats', category: 'Strength', unit: 'lbs', description: 'Lower body compound movement' },
  { id: '3', name: 'Running', category: 'Cardio', unit: 'miles', description: 'Cardiovascular endurance' },
  { id: '4', name: 'Push-ups', category: 'Strength', unit: 'reps', description: 'Bodyweight upper body exercise' },
  { id: '5', name: 'Deadlift', category: 'Strength', unit: 'lbs', description: 'Full body compound lift' },
  { id: '6', name: 'Yoga', category: 'Flexibility', unit: 'minutes', description: 'Flexibility and mindfulness' },
];

const mockGoals = [
  {
    id: '1',
    exerciseName: 'Bench Press',
    currentValue: 140,
    targetValue: 150,
    unit: 'lbs',
    targetDate: '2024-12-31',
    category: 'Strength'
  },
  {
    id: '2',
    exerciseName: 'Running',
    currentValue: 4.2,
    targetValue: 5.0,
    unit: 'miles',
    targetDate: '2024-11-15',
    category: 'Cardio'
  },
  {
    id: '3',
    exerciseName: 'Push-ups',
    currentValue: 50,
    targetValue: 50,
    unit: 'reps',
    targetDate: '2024-10-01',
    category: 'Strength'
  },
  {
    id: '4',
    exerciseName: 'Squats',
    currentValue: 65,
    targetValue: 100,
    unit: 'lbs',
    targetDate: '2024-12-15',
    category: 'Strength'
  },
  {
    id: '5',
    exerciseName: 'Yoga',
    currentValue: 20,
    targetValue: 30,
    unit: 'minutes',
    targetDate: '2024-11-30',
    category: 'Flexibility'
  }
];

export default function Goals() {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [selectedGoalForEdit, setSelectedGoalForEdit] = useState<typeof mockGoals[0] | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const { toast } = useToast();

  const handleEditGoal = (id: string) => {
    const goal = mockGoals.find(g => g.id === id);
    if (goal) {
      setSelectedGoalForEdit(goal);
      setShowEditGoal(true);
    }
  };

  const handleUpdateGoal = (goalId: string, updates: { exerciseName: string; targetValue: number; unit: string; targetDate: Date }) => {
    console.log('Updating goal:', goalId, updates);
    
    toast({
      title: "Goal Updated",
      description: `Successfully updated ${updates.exerciseName} target to ${updates.targetValue} ${updates.unit} by ${updates.targetDate.toLocaleDateString()}`,
    });
    
    // TODO: Implement actual goal update functionality with backend
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

  const filteredGoals = mockGoals.filter(goal => {
    const matchesSearch = goal.exerciseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || goal.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(mockGoals.map(goal => goal.category)));

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Goals</h1>
          <p className="text-muted-foreground">
            Set targets and track your fitness journey
          </p>
        </div>
        <Button
          onClick={() => setShowAddGoal(true)}
          data-testid="goals-add-button"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search goals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="search-goals"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]" data-testid="filter-category">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category.toLowerCase()}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGoals.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-muted-foreground">
              <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No goals found</p>
              <p className="text-sm">
                {searchTerm || filterCategory !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Start by creating your first fitness goal"}
              </p>
            </div>
          </div>
        ) : (
          filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              {...goal}
              onEdit={handleEditGoal}
              onAddProgress={handleAddProgress}
            />
          ))
        )}
      </div>

      {/* Goal Statistics */}
      {filteredGoals.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Goal Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {filteredGoals.filter(g => (g.currentValue / g.targetValue) >= 1).length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">
                {filteredGoals.filter(g => {
                  const progress = g.currentValue / g.targetValue;
                  return progress >= 0.5 && progress < 1;
                }).length}
              </div>
              <div className="text-sm text-muted-foreground">On Track</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">
                {filteredGoals.filter(g => (g.currentValue / g.targetValue) < 0.5).length}
              </div>
              <div className="text-sm text-muted-foreground">Getting Started</div>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <AddGoalDialog
        open={showAddGoal}
        onOpenChange={setShowAddGoal}
        exercises={mockExercises}
        onSubmit={handleAddGoal}
      />

      <EditGoalDialog
        open={showEditGoal}
        onOpenChange={(open) => {
          setShowEditGoal(open);
          if (!open) setSelectedGoalForEdit(null);
        }}
        goal={selectedGoalForEdit}
        onSubmit={handleUpdateGoal}
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