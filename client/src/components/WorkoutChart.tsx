import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip
} from "recharts";

interface ChartData {
  date: string;
  value: number;
  target?: number;
}

interface WorkoutChartProps {
  data: ChartData[];
  title: string;
  unit: string;
  className?: string;
}

export function WorkoutChart({ data, title, unit, className = "" }: WorkoutChartProps) {
  return (
    <div className={`px-3 pb-3 pt-4 ${className}`}>
      <ResponsiveContainer width="100%" height={210}>
        <AreaChart
          data={data}
          margin={{ top: 5, right: 0, left: -30, bottom: 5 }}
        >
          <defs>
            <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            className="text-xs text-muted-foreground"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            className="text-xs text-muted-foreground"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
              color: "hsl(var(--card-foreground))",
            }}
            labelStyle={{ color: "hsl(var(--muted-foreground))" }}
            formatter={(value: any) => [`${value} ${unit}`, "Value"]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fillOpacity={1}
            fill="url(#progressGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}