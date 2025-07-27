
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { PiggyBank, Target, DollarSign, TrendingUp } from "lucide-react";

interface SuperKPICardsProps {
  currentAge?: number;
  currentBalance?: number;
  currentSalary: number;
}

const SuperKPICards: React.FC<SuperKPICardsProps> = ({ currentAge, currentBalance, currentSalary }) => {
  if (!currentAge || !currentBalance) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Super Data</span>
            </div>
            <p className="text-lg font-bold text-muted-foreground">Not Available</p>
            <p className="text-xs text-muted-foreground">Age and balance required</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Australian super benchmarks by age
  const benchmarks = {
    25: 30000, 30: 60000, 35: 110000, 40: 180000, 45: 270000,
    50: 390000, 55: 550000, 60: 750000, 65: 1000000
  };

  const closestAge = Object.keys(benchmarks)
    .map(Number)
    .reduce((prev, curr) => 
      Math.abs(curr - currentAge) < Math.abs(prev - currentAge) ? curr : prev
    );

  const currentBenchmark = benchmarks[closestAge as keyof typeof benchmarks];
  const benchmarkRatio = (currentBalance / currentBenchmark) * 100;

  // Project super at 67
  const retirementYears = Math.max(67 - currentAge, 0);
  const monthlyGrowthRate = 0.07 / 12; // 7% annual growth
  const months = retirementYears * 12;
  
  // Current employer contributions (11.5%)
  const annualEmployerContrib = currentSalary * 0.115;
  
  // Future value with current contributions
  const futureValueCurrent = currentBalance * Math.pow(1 + monthlyGrowthRate, months) +
    (annualEmployerContrib / 12) * ((Math.pow(1 + monthlyGrowthRate, months) - 1) / monthlyGrowthRate);

  // Future value with additional 10% salary sacrifice
  const additionalContrib = currentSalary * 0.10;
  const totalAnnualContrib = annualEmployerContrib + additionalContrib;
  const futureValueExtra = currentBalance * Math.pow(1 + monthlyGrowthRate, months) +
    (totalAnnualContrib / 12) * ((Math.pow(1 + monthlyGrowthRate, months) - 1) / monthlyGrowthRate);

  // Retirement target (10x current salary)
  const retirementTarget = currentSalary * 10;
  const retirementReadiness = (futureValueCurrent / retirementTarget) * 100;

  // Tax savings from salary sacrifice (assuming 30% tax rate)
  const taxRate = currentSalary > 45000 ? 0.30 : 0.19; // Simplified tax calculation
  const annualTaxSavings = additionalContrib * taxRate;
  const monthlySacrificeNet = (additionalContrib / 12) * (1 - taxRate);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-muted-foreground">vs Benchmark</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{benchmarkRatio.toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground">
            ${currentBalance.toLocaleString()} / ${currentBenchmark.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-green-600" />
            <span className="text-sm text-muted-foreground">At Retirement</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            ${(futureValueCurrent / 1000000).toFixed(1)}M
          </p>
          <p className="text-xs text-muted-foreground">projected at 67</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-muted-foreground">Retirement Ready</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {retirementReadiness.toFixed(0)}%
          </p>
          <p className="text-xs text-muted-foreground">of target needed</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-muted-foreground">Tax Savings</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            ${annualTaxSavings.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            with 10% sacrifice (${monthlySacrificeNet.toFixed(0)}/month net)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperKPICards;
