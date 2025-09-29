import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface RecentSample {
  time: string;
  value: number;
  unit: string;
  label: string;
}

interface RecentSamplesCardProps {
  samples: RecentSample[];
}

export function RecentSamplesCard({ samples }: RecentSamplesCardProps) {
  const getTrend = (current: number, previous: number) => {
    if (current > previous * 1.1) return 'up';
    if (current < previous * 0.9) return 'down';
    return 'stable';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Samples
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {samples.map((sample, index) => {
            const previousSample = samples[index + 1];
            const trend = previousSample ? getTrend(sample.value, previousSample.value) : 'stable';
            
            return (
              <div key={sample.time} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{sample.time}</span>
                  {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
                  {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-600" />}
                </div>
                <div className="text-lg font-semibold">
                  {sample.value.toFixed(1)} {sample.unit}
                </div>
                <div className="text-xs text-muted-foreground">
                  {sample.label}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}