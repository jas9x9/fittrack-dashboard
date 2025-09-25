import { StatCard } from '../StatCard';
import { Target, Trophy, TrendingUp, Calendar } from 'lucide-react';

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      <StatCard
        title="Active Goals"
        value="12"
        change="+2 this month"
        changeType="positive"
        icon={Target}
        description="Goals currently being tracked"
      />
      <StatCard
        title="Completed Goals"
        value="8"
        change="+3 this month"
        changeType="positive"
        icon={Trophy}
        description="Goals achieved this year"
      />
      <StatCard
        title="Weekly Sessions"
        value="5"
        change="+1 from last week"
        changeType="positive"
        icon={TrendingUp}
        description="Workout sessions this week"
      />
      <StatCard
        title="Streak"
        value="14 days"
        change="Personal best!"
        changeType="positive"
        icon={Calendar}
        description="Current workout streak"
      />
    </div>
  );
}