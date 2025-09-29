import { Battery, BatteryCharging, BatteryLow, Zap, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { EnergyData } from '../utils/energyData';

interface BatteryStatusCardProps {
  data: EnergyData;
  batteryStatus: {
    status: 'Charging' | 'Discharging' | 'Standby';
    rate: number;
    timeToFull?: number;
    timeToEmpty?: number;
  };
}

export function BatteryStatusCard({ data, batteryStatus }: BatteryStatusCardProps) {
  const getStatusColor = () => {
    if (data.battery_soc_percent < 20) return 'bg-red-500';
    if (data.battery_soc_percent < 40) return 'bg-orange-500';
    if (data.battery_soc_percent < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = () => {
    if (batteryStatus.status === 'Charging') return <BatteryCharging className="h-5 w-5 text-green-600" />;
    if (batteryStatus.status === 'Discharging') return <BatteryLow className="h-5 w-5 text-orange-600" />;
    return <Battery className="h-5 w-5 text-blue-600" />;
  };

  const formatTime = (hours: number) => {
    if (hours > 24) return `${Math.round(hours / 24)}d`;
    if (hours > 1) return `${Math.round(hours)}h`;
    return `${Math.round(hours * 60)}m`;
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-green-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Battery & State
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* SOC and Status */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{data.battery_soc_percent.toFixed(1)}%</span>
          <Badge 
            variant="outline" 
            className={`${
              batteryStatus.status === 'Charging' ? 'bg-green-100 text-green-700 border-green-300' :
              batteryStatus.status === 'Discharging' ? 'bg-orange-100 text-orange-700 border-orange-300' :
              'bg-blue-100 text-blue-700 border-blue-300'
            }`}
          >
            {batteryStatus.status}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={data.battery_soc_percent} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Rate and Time Information */}
        {batteryStatus.rate > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {batteryStatus.status === 'Charging' ? 'Charging Rate' : 'Discharge Rate'}
              </span>
              <span className="text-sm font-medium">
                {batteryStatus.rate.toFixed(1)}%/h
              </span>
            </div>
            
            {batteryStatus.timeToFull && batteryStatus.status === 'Charging' && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-green-600" />
                <span>Full in: {formatTime(batteryStatus.timeToFull)}</span>
              </div>
            )}
            
            {batteryStatus.timeToEmpty && batteryStatus.status === 'Discharging' && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-orange-600" />
                <span>Empty in: {formatTime(batteryStatus.timeToEmpty)}</span>
              </div>
            )}
          </div>
        )}

        {/* State of Charge Indicator */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="h-2 bg-red-200 rounded mb-1">
              <div 
                className={`h-full bg-red-500 rounded transition-all ${
                  data.battery_soc_percent <= 20 ? 'w-full' : 'w-0'
                }`}
              />
            </div>
            <span className="text-muted-foreground">Low</span>
          </div>
          <div className="text-center">
            <div className="h-2 bg-yellow-200 rounded mb-1">
              <div 
                className={`h-full bg-yellow-500 rounded transition-all ${
                  data.battery_soc_percent > 20 && data.battery_soc_percent <= 70 ? 'w-full' : 'w-0'
                }`}
              />
            </div>
            <span className="text-muted-foreground">Med</span>
          </div>
          <div className="text-center">
            <div className="h-2 bg-green-200 rounded mb-1">
              <div 
                className={`h-full bg-green-500 rounded transition-all ${
                  data.battery_soc_percent > 70 ? 'w-full' : 'w-0'
                }`}
              />
            </div>
            <span className="text-muted-foreground">High</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}