import { useState } from 'react';
import { AlertTriangle, Info, CheckCircle, X, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";

interface Recommendation {
  message: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  action?: string;
  acknowledged?: boolean;
}

interface SmartRecommendationsCardProps {
  recommendations: Recommendation[];
}

export function SmartRecommendationsCard({ recommendations }: SmartRecommendationsCardProps) {
  const [acknowledgedRecs, setAcknowledgedRecs] = useState<Set<number>>(new Set());

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medium':
        return <Info className="h-4 w-4 text-orange-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-green-200 bg-green-50';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-green-100 text-green-700 border-green-300';
    }
  };

  const handleAcknowledge = (index: number) => {
    setAcknowledgedRecs(prev => new Set([...prev, index]));
  };

  const handleDismiss = (index: number) => {
    setAcknowledgedRecs(prev => new Set([...prev, index]));
  };

  // Sort recommendations by priority
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Smart Recommendations
          </div>
          <Badge variant="outline" className="text-xs">
            {recommendations.filter((_, i) => !acknowledgedRecs.has(i)).length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedRecommendations.map((rec, index) => {
          const isAcknowledged = acknowledgedRecs.has(index);
          
          if (rec.priority === 'high') {
            return (
              <Alert key={index} variant="destructive" className="relative">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="pr-16">
                  <div className="space-y-2">
                    <div className="font-semibold flex items-center gap-2">
                      <span>{rec.icon}</span>
                      {rec.message}
                    </div>
                    {rec.action && (
                      <div className="text-sm bg-red-100 p-2 rounded border border-red-200">
                        <strong>Action:</strong> {rec.action}
                      </div>
                    )}
                  </div>
                </AlertDescription>
                {!isAcknowledged && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleAcknowledge(index)}
                      className="h-6 w-6 p-0 bg-green-100 border-green-300 hover:bg-green-200"
                    >
                      <Check className="h-3 w-3 text-green-700" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDismiss(index)}
                      className="h-6 w-6 p-0 bg-gray-100 border-gray-300 hover:bg-gray-200"
                    >
                      <X className="h-3 w-3 text-gray-700" />
                    </Button>
                  </div>
                )}
                {isAcknowledged && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                )}
              </Alert>
            );
          }

          return (
            <div 
              key={index} 
              className={`p-3 rounded-lg border-2 transition-all ${
                isAcknowledged ? 'opacity-50' : ''
              } ${getPriorityColor(rec.priority)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(rec.priority)}
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPriorityBadgeColor(rec.priority)}`}
                    >
                      {rec.priority.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="font-medium flex items-center gap-2">
                    <span>{rec.icon}</span>
                    {rec.message}
                  </div>
                  
                  {rec.action && (
                    <div className="text-sm p-2 rounded bg-white/60 border">
                      <strong>Suggested Action:</strong> {rec.action}
                    </div>
                  )}
                </div>
                
                {!isAcknowledged && rec.priority !== 'low' && (
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleAcknowledge(index)}
                      className="h-7 px-2 text-xs"
                    >
                      Got it
                    </Button>
                  </div>
                )}
                
                {isAcknowledged && (
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                )}
              </div>
            </div>
          );
        })}
        
        {recommendations.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p>All systems operating optimally</p>
            <p className="text-sm">No recommendations at this time</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}