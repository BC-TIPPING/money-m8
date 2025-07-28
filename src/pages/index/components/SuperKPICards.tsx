
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

  // Australian super benchmarks by age (updated 2024)
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

  // Project super at 67 with proper calculations
  const retirementYears = Math.max(67 - currentAge, 0);
  const monthlyGrowthRate = 0.07 / 12; // 7% annual growth assumption
  const months = retirementYears * 12;
  
  // Current employer contributions (11.5% for 2024)
  const annualEmployerContrib = currentSalary * 0.115;
  
  // Future value with current contributions - proper formula
  const currentGrowthFactor = currentBalance > 0 ? Math.pow(1 + monthlyGrowthRate, months) : 1;
  const annuityFactor = months > 0 ? ((Math.pow(1 + monthlyGrowthRate, months) - 1) / monthlyGrowthRate) : 0;
  
  const futureValueCurrent = currentBalance * currentGrowthFactor + 
    (annualEmployerContrib / 12) * annuityFactor;

  // Future value with additional 10% salary sacrifice
  const additionalContrib = currentSalary * 0.10;
  const totalAnnualContrib = annualEmployerContrib + additionalContrib;
  const futureValueExtra = currentBalance * currentGrowthFactor + 
    (totalAnnualContrib / 12) * annuityFactor;

  // 4% rule calculation - how much annual income this provides
  const retirementIncomeeCurrent = futureValueCurrent * 0.04;
  const retirementIncomeExtra = futureValueExtra * 0.04;

  // Target using 4% rule (assume need 70% of current salary)
  const targetAnnualIncome = currentSalary * 0.70;
  const retirementTarget = targetAnnualIncome / 0.04; // 4% rule reversed
  const retirementReadiness = (futureValueCurrent / retirementTarget) * 100;

  // Tax savings from salary sacrifice (marginal tax rate estimation)
  const taxRate = currentSalary > 120000 ? 0.37 : 
                 currentSalary > 45000 ? 0.30 : 0.19;
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
          <p className="text-xs text-muted-foreground">
            ${retirementIncomeeCurrent.toLocaleString()}/year (4% rule)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-muted-foreground">Retirement Ready</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {Math.min(retirementReadiness, 999).toFixed(0)}%
          </p>
          <p className="text-xs text-muted-foreground">
            Target: ${(retirementTarget / 1000000).toFixed(1)}M
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-muted-foreground">+10% Impact</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            +${((retirementIncomeExtra - retirementIncomeeCurrent) / 1000).toFixed(0)}k
          </p>
          <p className="text-xs text-muted-foreground">
            extra annual income (${annualTaxSavings.toLocaleString()} tax saved)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperKPICards;
