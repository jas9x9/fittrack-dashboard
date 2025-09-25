import { 
  Home, 
  Target, 
  Activity, 
  BarChart3, 
  Dumbbell,
  Plus
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Goals",
    url: "/goals", 
    icon: Target,
  },
  {
    title: "Workouts",
    url: "/workouts",
    icon: Activity,
  },
  {
    title: "Analytics", 
    url: "/analytics",
    icon: BarChart3,
  },
];

interface AppSidebarProps {
  onAddGoal?: () => void;
  onAddWorkout?: () => void;
}

export function AppSidebar({ onAddGoal, onAddWorkout }: AppSidebarProps) {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">FitTrack</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase()}`}
                  >
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2 px-2">
              {onAddGoal && (
                <Button
                  onClick={onAddGoal}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  data-testid="sidebar-add-goal"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              )}
              {onAddWorkout && (
                <Button
                  onClick={onAddWorkout}
                  size="sm"
                  className="w-full justify-start"
                  data-testid="sidebar-add-workout"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Log Workout
                </Button>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="text-xs text-muted-foreground text-center">
          Track your fitness journey 💪
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}