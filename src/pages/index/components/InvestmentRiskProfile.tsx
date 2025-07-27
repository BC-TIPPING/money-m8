
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Shield, AlertTriangle } from 'lucide-react';

interface InvestmentRiskProfileProps {
  currentAge: number;
  monthlySurplus: number;
  totalDebt: number;
}

const InvestmentRiskProfile: React.FC<InvestmentRiskProfileProps> = ({
  currentAge,
  monthlySurplus,
  totalDebt
}) => {
  const calculateRiskCapacity = () => {
    let score = 0;
    
    // Age factor (younger = higher capacity)
    if (currentAge < 30) score += 40;
    else if (currentAge < 40) score += 30;
    else if (currentAge < 50) score += 20;
    else if (currentAge < 60) score += 10;
    
    // Surplus factor
    if (monthlySurplus > 2000) score += 30;
    else if (monthlySurplus > 1000) score += 20;
    else if (monthlySurplus > 500) score += 10;
    
    // Debt factor (lower debt = higher capacity)
    if (totalDebt === 0) score += 30;
    else if (totalDebt < 50000) score += 20;
    else if (totalDebt < 100000) score += 10;
    
    return Math.min(score, 100);
  };

  const riskCapacity = calculateRiskCapacity();
  
  const getRiskProfile = () => {
    if (riskCapacity >= 80) return { level: "High", color: "text-red-600", description: "Can handle significant volatility for higher returns" };
    if (riskCapacity >= 60) return { level: "Moderate-High", color: "text-orange-600", description: "Can handle moderate volatility with growth focus" };
    if (riskCapacity >= 40) return { level: "Moderate", color: "text-yellow-600", description: "Balanced approach between growth and stability" };
    if (riskCapacity >= 20) return { level: "Conservative", color: "text-blue-600", description: "Focus on capital preservation with modest growth" };
    return { level: "Very Conservative", color: "text-green-600", description: "Capital preservation is the priority" };
  };

  const profile = getRiskProfile();

  const getRecommendations = () => {
    const recommendations = [];
    
    if (riskCapacity >= 60) {
      recommendations.push("Consider growth-focused ETFs or managed funds");
      recommendations.push("Look into diversified international investments");
    }
    
    if (riskCapacity >= 40) {
      recommendations.push("Mix of growth and defensive assets");
      recommendations.push("Consider adding REITs to your portfolio");
    }
    
    if (riskCapacity < 40) {
      recommendations.push("Focus on high-yield savings and term deposits");
      recommendations.push("Consider conservative balanced funds");
    }
    
    if (totalDebt > 0) {
      recommendations.push("Prioritize high-interest debt repayment first");
    }
    
    return recommendations;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Investment Risk Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${profile.color}`}>
                {riskCapacity}
              </div>
              <div className="text-sm text-gray-600">Risk Score</div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{profile.level}</Badge>
              </div>
              <Progress value={riskCapacity} className="h-2 mb-2" />
              <p className="text-sm text-gray-600">{profile.description}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold">Age Factor</div>
              <div className="text-gray-600">{currentAge} years</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">Monthly Surplus</div>
              <div className="text-gray-600">${monthlySurplus.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">Total Debt</div>
              <div className="text-gray-600">${totalDebt.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Recommended Investment Approach
            </h4>
            <ul className="space-y-1 text-sm">
              {getRecommendations().map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentRiskProfile;
