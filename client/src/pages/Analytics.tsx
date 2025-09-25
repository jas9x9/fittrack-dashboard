import { WorkoutChart } from "@/components/WorkoutChart";
import { StatCard } from "@/components/StatCard";
import { ProgressRing } from "@/components/ProgressRing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Activity, 
  Calendar,
  Award
} from "lucide-react";

// TODO: Remove mock data when implementing real backend
const mockProgressData = [
  { date: 'Jan 1', value: 135 },
  { date: 'Jan 3', value: 138 },
  { date: 'Jan 6', value: 140 },
  { date: 'Jan 10', value: 140 },
  { date: 'Jan 13', value: 142 },
  { date: 'Jan 15', value: 145 },
];

const mockCardioData = [
  { date: 'Jan 1', value: 3.2 },
  { date: 'Jan 4', value: 3.5 },
  { date: 'Jan 7', value: 3.8 },
  { date: 'Jan 11', value: 4.0 },
  { date: 'Jan 14', value: 4.2 },
];

const mockGoalProgress = [
  { exercise: 'Bench Press', current: 145, target: 150, unit: 'lbs', progress: 96.7 },
  { exercise: 'Running', current: 4.2, target: 5.0, unit: 'miles', progress: 84.0 },
  { exercise: 'Squats', current: 85, target: 100, unit: 'lbs', progress: 85.0 },
  { exercise: 'Push-ups', current: 50, target: 50, unit: 'reps', progress: 100.0 },
];

const mockAchievements = [
  { title: 'Push-up Master', description: 'Achieved 50 consecutive push-ups', date: '2024-01-10', icon: '💪' },
  { title: 'Consistency Champion', description: '7-day workout streak', date: '2024-01-15', icon: '🔥' },
  { title: 'Bench Press Beast', description: 'New personal record: 145 lbs', date: '2024-01-15', icon: '🏆' },
];

export default function Analytics() {
  const totalGoals = mockGoalProgress.length;
  const completedGoals = mockGoalProgress.filter(g => g.progress >= 100).length;
  const averageProgress = mockGoalProgress.reduce((acc, g) => acc + g.progress, 0) / totalGoals;

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Detailed insights into your fitness progress
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Goal Completion"
          value={`${completedGoals}/${totalGoals}`}
          change={`${((completedGoals / totalGoals) * 100).toFixed(0)}% complete`}
          changeType="positive"
          icon={Target}
          description="Goals achieved vs total"
        />
        <StatCard
          title="Avg Progress"
          value={`${averageProgress.toFixed(1)}%`}
          change="+12% this month"
          changeType="positive"
          icon={TrendingUp}
          description="Average goal completion"
        />
        <StatCard
          title="Active Streak"
          value="7 days"
          change="Personal best!"
          changeType="positive"
          icon={Calendar}
          description="Current workout streak"
        />
        <StatCard
          title="Total Workouts"
          value="24"
          change="+8 this month"
          changeType="positive"
          icon={Activity}
          description="Sessions completed this month"
        />
      </div>

      {/* Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg">
          <WorkoutChart 
            data={mockProgressData}
            title="Strength Progress (Bench Press)"
            unit="lbs"
          />
        </div>
        <div className="bg-card border rounded-lg">
          <WorkoutChart 
            data={mockCardioData}
            title="Cardio Progress (Running)"
            unit="miles"
          />
        </div>
      </div>

      {/* Goal Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockGoalProgress.map((goal, index) => (
              <div key={index} className="flex flex-col items-center space-y-3">
                <ProgressRing progress={goal.progress} size={80} />
                <div className="text-center">
                  <h4 className="font-medium">{goal.exercise}</h4>
                  <p className="text-sm text-muted-foreground font-mono">
                    {goal.current} / {goal.target} {goal.unit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium">Bench Press</h4>
                  <p className="text-sm text-muted-foreground">Strength Training</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg">+7.4%</div>
                <div className="text-xs text-green-600 dark:text-green-400">Last 30 days</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium">Running</h4>
                  <p className="text-sm text-muted-foreground">Cardio</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg">+31.3%</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Last 30 days</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h4 className="font-medium">Squats</h4>
                  <p className="text-sm text-muted-foreground">Strength Training</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg">-2.1%</div>
                <div className="text-xs text-red-600 dark:text-red-400">Last 30 days</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Recent Achievements</CardTitle>
          <Award className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAchievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg hover-elevate">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium">{achievement.title}</h4>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {new Date(achievement.date).toLocaleDateString()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}