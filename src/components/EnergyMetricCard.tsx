import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { LucideIcon } from "lucide-react";

interface EnergyMetricCardProps {
  title: string;
  value: number;
  unit: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  status?: 'good' | 'warning' | 'critical';
  subtitle?: string;
  className?: string;
}

const statusColors = {
  good: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800', 
  critical: 'bg-red-50 border-red-200 text-red-800'
};

const iconColors = {
  good: 'text-green-600',
  warning: 'text-yellow-600',
  critical: 'text-red-600'
};

export function EnergyMetricCard({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  trend, 
  status = 'good',
  subtitle,
  className = ""
}: EnergyMetricCardProps) {
  return (
    <Card className={`${statusColors[status]} ${className} transition-all duration-300 hover:shadow-lg`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${iconColors[status]}`} />
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
        {trend && (
          <Badge variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl">{value.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}