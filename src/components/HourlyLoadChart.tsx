import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Activity } from 'lucide-react';

interface HourlyLoadChartProps {
  currentHour: number;
  currentLoad: number;
}

export function HourlyLoadChart({ currentHour, currentLoad }: HourlyLoadChartProps) {
  // Generate hourly load pattern for Rajasthan (hot climate)
  const generateHourlyData = () => {
    const data = [];
    for (let hour = 0; hour < 24; hour++) {
      let loadMultiplier;
      
      if (hour < 5) loadMultiplier = 0.3; // Early morning low
      else if (hour < 7) loadMultiplier = 0.5; // Morning rise
      else if (hour < 10) loadMultiplier = 0.7; // Morning peak
      else if (hour < 14) loadMultiplier = 0.9; // Midday AC load
      else if (hour < 17) loadMultiplier = 1.0; // Afternoon peak (hottest)
      else if (hour < 20) loadMultiplier = 0.8; // Evening
      else if (hour < 23) loadMultiplier = 0.6; // Night
      else loadMultiplier = 0.4; // Late night
      
      const load = 250 * loadMultiplier;
      
      data.push({
        hour,
        load: Math.round(load),
        isCurrentHour: hour === currentHour
      });
    }
    return data;
  };

  const hourlyData = generateHourlyData();
  const maxLoad = Math.max(...hourlyData.map(d => d.load));

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" />
          Hourly Load (kW)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Simple bar chart using divs */}
        <div className="h-32 flex items-end justify-between gap-1 mb-3">
          {hourlyData.map((data, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col items-center"
            >
              <div
                className={`w-full rounded-t transition-all ${
                  data.isCurrentHour 
                    ? 'bg-blue-500' 
                    : 'bg-gray-200'
                }`}
                style={{
                  height: `${(data.load / maxLoad) * 100}%`,
                  minHeight: '2px'
                }}
              />
              {index % 4 === 0 && (
                <span className="text-xs text-muted-foreground mt-1">
                  {data.hour.toString().padStart(2, '0')}
                </span>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>00:00</span>
          <span className="font-medium text-blue-600">
            Now: {currentLoad.toFixed(0)} kW
          </span>
          <span>23:00</span>
        </div>
      </CardContent>
    </Card>
  );
}