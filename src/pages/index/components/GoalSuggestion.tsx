
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';

interface GoalSuggestionProps {
  monthlySurplus: number;
  age: number;
  totalDebt: number;
  superBalance: number;
  currentGoals: string[];
}

const GoalSuggestion: React.FC<GoalSuggestionProps> = ({ 
  monthlySurplus, 
  age, 
  totalDebt, 
  superBalance, 
  currentGoals 
}) => {
  const getSuggestedGoal = () => {
    if (totalDebt > 0) {
      return {
        title: "Reduce Debt",
        description: "Focus on paying off high-interest debt first",
        icon: <AlertTriangle className="h-5 w-5" />,
        priority: "High",
        action: "Start with highest interest rate debt"
      };
    }
    
    if (monthlySurplus < 0) {
      return {
        title: "Set a Budget",
        description: "Your expenses exceed your income",
        icon: <DollarSign className="h-5 w-5" />,
        priority: "High",
        action: "Track expenses and reduce spending"
      };
    }
    
    if (age < 40 && superBalance < age * 10000) {
      return {
        title: "Maximise Super",
        description: "Your super balance is below recommended levels",
        icon: <TrendingUp className="h-5 w-5" />,
        priority: "Medium",
        action: "Consider additional super contributions"
      };
    }
    
    return {
      title: "Grow Investments",
      description: "Build wealth through diversified investments",
      icon: <Target className="h-5 w-5" />,
      priority: "Medium",
      action: "Start with low-cost index funds"
    };
  };

  const suggestion = getSuggestedGoal();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Recommended Next Step
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            {suggestion.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold">{suggestion.title}</h4>
              <Badge variant={suggestion.priority === "High" ? "destructive" : "secondary"}>
                {suggestion.priority}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
            <p className="text-sm font-medium text-blue-600">{suggestion.action}</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-gray-500">
            Based on your current financial situation and goals: {currentGoals.join(', ')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalSuggestion;
