import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Trophy, TrendingUp, TrendingDown, Minus, Plus } from "lucide-react";

interface WorkoutSession {
  id: string;
  exerciseName: string;
  value: number;
  unit: string;
  date: string;
  notes?: string;
  change?: number; // percentage change from previous session
}

interface WorkoutSessionListProps {
  sessions: WorkoutSession[];
  title?: string;
  onAddSession?: () => void;
  className?: string;
}

export function WorkoutSessionList({
  sessions,
  title = "Recent Workouts",
  onAddSession,
  className = ""
}: WorkoutSessionListProps) {

  const getChangeIcon = (change?: number) => {
    if (!change) return <Minus className="h-3 w-3" />;
    if (change > 0) return <TrendingUp className="h-3 w-3 text-primary" />;
    return <TrendingDown className="h-3 w-3 text-red-500" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {onAddSession && (
          <Button
            onClick={onAddSession}
            size="sm"
            data-testid="button-add-workout-session"
          >
            <Plus className="h-4 w-4 mr-2" />
            Log Workout
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No workout sessions yet</p>
            <p className="text-sm">Start by logging your first workout!</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
              data-testid={`workout-session-${session.id}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium">{session.exerciseName}</h4>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(session.date)}</span>
                  </div>
                  {session.notes && (
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {session.notes}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {session.change !== undefined && (
                  <div className="flex items-center gap-1 text-xs">
                    {getChangeIcon(session.change)}
                    {session.change !== 0 && (
                      <span className={session.change > 0 ? "text-primary" : "text-red-500"}>
                        {session.change > 0 ? "+" : ""}{session.change.toFixed(1)}%
                      </span>
                    )}
                  </div>
                )}
                <div className="text-right">
                  <div className="text-lg font-semibold font-mono">
                    {session.value} {session.unit}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}