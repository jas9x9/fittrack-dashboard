import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AddGoalDialog } from "@/components/AddGoalDialog";
import { AddWorkoutDialog } from "@/components/AddWorkoutDialog";
import Dashboard from "@/pages/Dashboard";
import Goals from "@/pages/Goals";
import Workouts from "@/pages/Workouts";
import Analytics from "@/pages/Analytics";
import NotFound from "@/pages/not-found";

// TODO: Remove mock data when implementing real backend
const mockExercises = [
  { id: '1', name: 'Bench Press', category: 'Strength', unit: 'lbs', description: 'Chest and tricep strength exercise' },
  { id: '2', name: 'Squats', category: 'Strength', unit: 'lbs', description: 'Lower body compound movement' },
  { id: '3', name: 'Running', category: 'Cardio', unit: 'miles', description: 'Cardiovascular endurance' },
  { id: '4', name: 'Push-ups', category: 'Strength', unit: 'reps', description: 'Bodyweight upper body exercise' },
  { id: '5', name: 'Deadlift', category: 'Strength', unit: 'lbs', description: 'Full body compound lift' },
];

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/goals" component={Goals} />
      <Route path="/workouts" component={Workouts} />
      <Route path="/analytics" component={Analytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddWorkout, setShowAddWorkout] = useState(false);

  const handleAddGoal = (goal: any) => {
    console.log('New goal created from global handler:', goal);
    // TODO: Implement global add goal functionality
  };

  const handleAddWorkout = (workout: any) => {
    console.log('New workout logged from global handler:', workout);
    // TODO: Implement global add workout functionality
  };

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="fittrack-theme">
        <TooltipProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar 
                onAddGoal={() => setShowAddGoal(true)}
                onAddWorkout={() => setShowAddWorkout(true)}
              />
              <div className="flex flex-col flex-1">
                <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <ThemeToggle />
                </header>
                <main className="flex-1 overflow-auto">
                  <Router />
                </main>
              </div>
            </div>

            {/* Global Dialogs */}
            <AddGoalDialog
              open={showAddGoal}
              onOpenChange={setShowAddGoal}
              exercises={mockExercises}
              onSubmit={handleAddGoal}
            />

            <AddWorkoutDialog
              open={showAddWorkout}
              onOpenChange={setShowAddWorkout}
              exercises={mockExercises}
              onSubmit={handleAddWorkout}
            />

            <Toaster />
          </SidebarProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
