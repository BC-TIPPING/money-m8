import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown, DollarSign, PiggyBank, Shield, Home, Target } from 'lucide-react';
import { type DebtDetail } from './assessmentHooks';
import { calculateMonthlyAmount, calculateAustralianIncomeTax } from '@/lib/financialCalculations';
import IncomeComparisonChart from './components/IncomeComparisonChart';
import SuperKPICards from './components/SuperKPICards';
import SuperBenchmarkChart from './components/SuperBenchmarkChart';
import InvestmentRiskProfile from './components/InvestmentRiskProfile';
import DebtSummaryTable from './components/DebtSummaryTable';
import BudgetRecap from './components/BudgetRecap';
import GoalSuggestion from './components/GoalSuggestion';

export interface FullFinancialHealthCheckProps {
  age: number | undefined;
  postcode: string;
  superBalance: number | undefined;
  debtTypes: string[];
  debtDetails: DebtDetail[];
  incomeSources: { category: string; amount: string; frequency: string }[];
  expenseItems: { category: string; amount: string; frequency: string }[];
  goals: string[];
  insurances: string[];
}

export default function FullFinancialHealthCheck({
  age,
  postcode,
  superBalance,
  debtTypes,
  debtDetails,
  incomeSources,
  expenseItems,
  goals,
  insurances,
}: FullFinancialHealthCheckProps) {
  
  const totalMonthlyGrossIncome = calculateMonthlyAmount(incomeSources);
  const totalAnnualGrossIncome = totalMonthlyGrossIncome * 12;
  const annualTax = calculateAustralianIncomeTax(totalAnnualGrossIncome);
  const totalMonthlyNetIncome = totalAnnualGrossIncome > 0 ? (totalAnnualGrossIncome - annualTax) / 12 : 0;
  const totalMonthlyExpenses = calculateMonthlyAmount(expenseItems);
  const monthlySurplus = totalMonthlyNetIncome - totalMonthlyExpenses;

  const totalDebt = debtDetails.reduce((sum, debt) => sum + parseFloat(debt.balance || '0'), 0);
  const totalMonthlyDebtRepayments = debtDetails.reduce((sum, debt) => sum + parseFloat(debt.repayments || '0'), 0);

  const netWorth = (superBalance || 0) - totalDebt;
  const debtToIncomeRatio = totalAnnualGrossIncome > 0 ? (totalDebt / totalAnnualGrossIncome) * 100 : 0;
  const savingsRate = totalMonthlyNetIncome > 0 ? (monthlySurplus / totalMonthlyNetIncome) * 100 : 0;

  const getHealthScore = () => {
    let score = 0;
    
    // Income stability (20 points)
    if (totalMonthlyNetIncome > 0) score += 20;
    
    // Savings rate (20 points)
    if (savingsRate > 20) score += 20;
    else if (savingsRate > 10) score += 15;
    else if (savingsRate > 0) score += 10;
    
    // Debt management (20 points)
    if (debtToIncomeRatio === 0) score += 20;
    else if (debtToIncomeRatio < 20) score += 15;
    else if (debtToIncomeRatio < 40) score += 10;
    else if (debtToIncomeRatio < 60) score += 5;
    
    // Emergency fund (15 points) - approximated by monthly surplus
    if (monthlySurplus > totalMonthlyExpenses * 0.5) score += 15;
    else if (monthlySurplus > totalMonthlyExpenses * 0.25) score += 10;
    else if (monthlySurplus > 0) score += 5;
    
    // Super balance (15 points) - age-based benchmark
    if (age && superBalance) {
      const superBenchmark = age * (totalAnnualGrossIncome / 10);
      if (superBalance >= superBenchmark) score += 15;
      else if (superBalance >= superBenchmark * 0.75) score += 10;
      else if (superBalance >= superBenchmark * 0.5) score += 5;
    }
    
    // Insurance coverage (10 points)
    const hasEssentialInsurance = insurances.some(ins => 
      ins === 'Life Insurance' || ins === 'Income Protection' || ins === 'Health Insurance'
    );
    if (hasEssentialInsurance) score += 10;
    else if (insurances.length > 0) score += 5;
    
    return Math.min(score, 100);
  };

  const healthScore = getHealthScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const identifyGaps = () => {
    const gaps = [];
    
    if (savingsRate < 10) {
      gaps.push({
        icon: <PiggyBank className="h-5 w-5 text-red-500" />,
        title: "Low Savings Rate",
        description: `Your savings rate is ${savingsRate.toFixed(1)}%. Aim for at least 10-20% of your income.`,
        priority: "High"
      });
    }
    
    if (debtToIncomeRatio > 40) {
      gaps.push({
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
        title: "High Debt-to-Income Ratio",
        description: `Your debt is ${debtToIncomeRatio.toFixed(1)}% of your income. Consider debt consolidation or reduction strategies.`,
        priority: "High"
      });
    }
    
    if (age && superBalance) {
      const superBenchmark = age * (totalAnnualGrossIncome / 10);
      if (superBalance < superBenchmark * 0.5) {
        gaps.push({
          icon: <TrendingDown className="h-5 w-5 text-orange-500" />,
          title: "Superannuation Shortfall",
          description: `Your super balance is below recommended levels for your age. Consider increasing contributions.`,
          priority: "Medium"
        });
      }
    }
    
    if (!insurances.includes('Income Protection')) {
      gaps.push({
        icon: <Shield className="h-5 w-5 text-orange-500" />,
        title: "Income Protection",
        description: "Consider income protection insurance to safeguard your earning capacity.",
        priority: "Medium"
      });
    }
    
    if (!insurances.includes('Health Insurance') && totalAnnualGrossIncome > 97000) {
      const surcharge = Math.min(totalAnnualGrossIncome * 0.015, totalAnnualGrossIncome * 0.01);
      gaps.push({
        icon: <Shield className="h-5 w-5 text-orange-500" />,
        title: "Private Health Insurance",
        description: `Consider private health insurance to avoid Medicare Levy Surcharge of $${surcharge.toFixed(0)}`,
        priority: "Medium"
      });
    }
    
    return gaps;
  };

  const coverageGaps = identifyGaps();

  return (
    <div className="space-y-6">
      {/* Financial Health Score */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" />
            Financial Health Score
          </CardTitle>
          <CardDescription>
            Your overall financial wellness based on key metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(healthScore)}`}>
                {healthScore}
              </div>
              <div className="text-sm text-gray-600">out of 100</div>
              <Badge variant={healthScore >= 80 ? "default" : healthScore >= 60 ? "secondary" : "destructive"}>
                {getScoreLabel(healthScore)}
              </Badge>
            </div>
            <div className="flex-1">
              <Progress value={healthScore} className="h-4 mb-2" />
              <div className="text-sm text-gray-600">
                {healthScore >= 80 ? "You're doing great! Keep up the good work." :
                 healthScore >= 60 ? "Good progress! There's room for improvement." :
                 "Focus on the key areas below to improve your financial health."}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4" />
              Net Worth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${netWorth.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">
              Assets minus liabilities
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              Savings Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {savingsRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">
              Monthly surplus/income
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4" />
              Debt Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {debtToIncomeRatio.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">
              Total debt/annual income
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <PiggyBank className="h-4 w-4" />
              Monthly Surplus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${monthlySurplus.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">
              Available for savings/investments
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coverage Gaps */}
      {coverageGaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Coverage Gaps Identified
            </CardTitle>
            <CardDescription>
              Areas that need your attention to improve your financial security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {coverageGaps.map((gap, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {gap.icon}
                  <div className="flex-1">
                    <div className="font-semibold">{gap.title}</div>
                    <div className="text-sm text-gray-600">{gap.description}</div>
                  </div>
                  <Badge variant={gap.priority === "High" ? "destructive" : "secondary"}>
                    {gap.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analysis Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeComparisonChart 
          currentIncome={totalAnnualGrossIncome}
          postcode={postcode}
        />
        
        <SuperKPICards 
          currentBalance={superBalance || 0}
          age={age || 30}
          annualIncome={totalAnnualGrossIncome}
        />
      </div>

      <SuperBenchmarkChart 
        currentBalance={superBalance || 0}
        age={age || 30}
        annualIncome={totalAnnualGrossIncome}
      />

      <InvestmentRiskProfile 
        age={age || 30}
        monthlySurplus={monthlySurplus}
        totalDebt={totalDebt}
      />

      {debtDetails.length > 0 && (
        <DebtSummaryTable debtDetails={debtDetails} />
      )}

      <BudgetRecap 
        totalMonthlyNetIncome={totalMonthlyNetIncome}
        totalMonthlyExpenses={totalMonthlyExpenses}
        expenseItems={expenseItems}
      />

      <GoalSuggestion 
        monthlySurplus={monthlySurplus}
        age={age || 30}
        totalDebt={totalDebt}
        superBalance={superBalance || 0}
        currentGoals={goals}
      />
    </div>
  );
}
