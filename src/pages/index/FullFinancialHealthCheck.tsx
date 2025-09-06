
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, Shield, Home, PiggyBank, Target, BarChart3, DollarSign, Calendar, TrendingDown, Loader2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import IncomeComparisonChart from "./components/IncomeComparisonChart";
import SuperBenchmarkChart from "./components/SuperBenchmarkChart";
import DebtPayoffVisualization from "./components/DebtPayoffVisualization";
import InvestmentRiskProfile from "./components/InvestmentRiskProfile";
import BudgetRecap from "./components/BudgetRecap";
import DebtSummaryTable from "./components/DebtSummaryTable";
import SuperKPICards from "./components/SuperKPICards";
import PostDebtInvestmentVisualization from "./components/PostDebtInvestmentVisualization";
import HealthCheckAISearchSection from "./components/HealthCheckAISearchSection";
import { calculateMonthlyAmount, calculateAustralianIncomeTax } from "@/lib/financialCalculations";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FullFinancialHealthCheckProps {
  age?: number;
  postcode?: string;
  superBalance?: number;
  superFund?: string;
  mortgageRate?: number;
  insurances: string[];
  assets: { type: string; value: string; description: string }[];
  debtTypes: string[];
  debtDetails: any[];
  incomeSources: { category: string; amount: string; frequency: string }[];
  expenseItems: { category: string; amount: string; frequency: string }[];
  goals: string[];
  generateSummary?: (options: { personality?: string }) => void;
  isGeneratingSummary?: boolean;
  aiSummary?: string;
}

const FullFinancialHealthCheck: React.FC<FullFinancialHealthCheckProps> = ({
  age,
  postcode,
  superBalance,
  superFund,
  mortgageRate,
  insurances,
  assets,
  debtTypes,
  debtDetails,
  incomeSources,
  expenseItems,
  goals,
  generateSummary,
  isGeneratingSummary,
  aiSummary
}) => {
  const [showToughLove, setShowToughLove] = useState(false);
  // Calculate income using the established function
  const monthlyIncome = calculateMonthlyAmount(incomeSources);
  const annualIncome = monthlyIncome * 12;
  const annualTax = calculateAustralianIncomeTax(annualIncome);
  const monthlyNetIncome = annualIncome > 0 ? (annualIncome - annualTax) / 12 : 0;
  
  // Separate savings/investments from other expenses
  const savingsAndInvestmentsAmount = calculateMonthlyAmount(
    expenseItems.filter(item => item.category === 'Savings & Investments')
  );
  const nonSavingsExpenses = calculateMonthlyAmount(
    expenseItems.filter(item => item.category !== 'Savings & Investments')
  );
  const monthlyExpenses = nonSavingsExpenses;
  const monthlySurplus = monthlyNetIncome - monthlyExpenses;
  
  // Total savings rate includes both allocated savings/investments and any surplus
  const totalMonthlySavings = savingsAndInvestmentsAmount + Math.max(0, monthlySurplus);
  const savingsRate = monthlyNetIncome > 0 ? (totalMonthlySavings / monthlyNetIncome) * 100 : 0;

  // Australian income benchmarks - must match IncomeComparisonChart exactly
  const nationalMedian = 88400; // Updated to median full-time ~A$88,400/year
  const nationalAverage = 92000;
  
  // Use the same postcode median calculation as IncomeComparisonChart
  const getPostcodeMedian = (postcode: string): number => {
    const firstDigit = parseInt(postcode.substring(0, 1));
    // Rough estimates based on state income patterns from ATO data
    switch (firstDigit) {
      case 1: return 65000; // NSW regional
      case 2: return 85000; // NSW metro (Sydney)
      case 3: return 75000; // VIC
      case 4: return 70000; // QLD
      case 5: return 68000; // SA
      case 6: return 80000; // WA
      case 7: return 62000; // TAS
      case 8: return 75000; // NT
      case 9: return 70000; // ACT
      default: return nationalMedian;
    }
  };
  
  const postcodeMedian = postcode ? getPostcodeMedian(postcode) : nationalMedian;

  // Income analysis
  const getIncomePercentile = () => {
    if (annualIncome >= 225000) return { percentile: 90, level: "Top 10%" };
    if (annualIncome >= 120000) return { percentile: 80, level: "Top 20%" };
    if (annualIncome >= 80000) return { percentile: 65, level: "Above Average" };
    if (annualIncome >= 50000) return { percentile: 50, level: "Median" };
    return { percentile: 30, level: "Below Average" };
  };

  // High-interest debt analysis
  const getHighInterestDebtAnalysis = () => {
    console.log('Debug - All debt details:', debtDetails);
    
    const highInterestDebts = debtDetails.filter(debt => {
      const hasBalance = parseFloat(debt.balance) > 0;
      const interestRate = parseFloat(debt.interestRate);
      // Consider debt high-interest if rate is above 8% (excluding mortgage which is typically lower)
      // Also include traditional high-interest debt types regardless of rate
      const isHighInterestRate = interestRate > 8;
      const isHighInterestType = ['Credit Card', 'Personal Loan', 'BNPL (e.g. Afterpay)'].includes(debt.type);
      const isHighInterest = isHighInterestRate || isHighInterestType;
      console.log(`Debug - Debt: ${debt.type}, Rate: ${interestRate}%, IsHighInterestRate: ${isHighInterestRate}, IsHighInterestType: ${isHighInterestType}, HasBalance: ${hasBalance}, Balance: ${debt.balance}`);
      return isHighInterest && hasBalance;
    });
    
    console.log('Debug - Filtered high interest debts:', highInterestDebts);
    
    if (highInterestDebts.length === 0) {
      console.log('Debug - No high interest debts found, returning null');
      return null;
    }
    
    const totalBalance = highInterestDebts.reduce((sum, debt) => sum + parseFloat(debt.balance), 0);
    
    // Only return analysis if there's actually significant high-interest debt
    if (totalBalance <= 0) {
      console.log('Debug - Total balance is 0 or negative, returning null');
      return null;
    }
    
    const weightedRate = highInterestDebts.reduce((sum, debt) => 
      sum + (parseFloat(debt.balance) * parseFloat(debt.interestRate)), 0
    ) / totalBalance;
    
    const result = { totalBalance, weightedRate, debts: highInterestDebts };
    console.log('Debug - Returning high interest debt analysis:', result);
    return result;
  };

  // Insurance analysis
  const getInsuranceAnalysis = () => {
    const recommendations = [];
    
    if (!insurances.includes("Life Insurance")) {
      recommendations.push({
        type: "Life Insurance",
        recommended: annualIncome * 10,
        reason: "10x annual income is standard coverage"
      });
    }
    
    if (!insurances.includes("Income Protection")) {
      recommendations.push({
        type: "Income Protection",
        recommended: annualIncome * 0.75,
        reason: "75% of income replacement until age 65"
      });
    }
    
    // Medicare Levy Surcharge thresholds for 2025-26
    const medicareThreshold = 101000; // Single person threshold
    const familyThreshold = 202000; // Family threshold
    
    // Calculate surcharge rate based on 2025-26 tiers
    let surchargeRate = 0;
    if (annualIncome > medicareThreshold) {
      if (annualIncome <= 118000) {
        surchargeRate = 0.01; // Tier 1: 1%
      } else if (annualIncome <= 158000) {
        surchargeRate = 0.0125; // Tier 2: 1.25%
      } else {
        surchargeRate = 0.015; // Tier 3: 1.5%
      }
    }
    
    const surchargeAmount = annualIncome * surchargeRate;
    
    const needsPrivateHealth = annualIncome > medicareThreshold && 
      !insurances.includes("Health Insurance");
    
    if (needsPrivateHealth) {
      recommendations.push({
        type: "Private Health Insurance",
        recommended: 2500,
        reason: `Avoid Medicare Levy Surcharge of $${surchargeAmount.toLocaleString()}`
      });
    }
    
    return { recommendations, needsPrivateHealth, medicareThreshold, surchargeAmount };
  };

  // Calculate financial health score
  const calculateHealthScore = () => {
    let score = 0;
    
    // Income score (20 points)
    const incomeData = getIncomePercentile();
    score += Math.min(incomeData.percentile / 100 * 20, 20);
    
    // Super score (25 points)
    if (age && superBalance) {
      const benchmarks = { 25: 30000, 30: 60000, 35: 110000, 40: 180000, 45: 270000, 50: 390000, 55: 550000, 60: 750000, 65: 1000000 };
      const closestAge = Object.keys(benchmarks).map(Number).reduce((prev, curr) => 
        Math.abs(curr - age) < Math.abs(prev - age) ? curr : prev
      );
      const benchmark = benchmarks[closestAge as keyof typeof benchmarks];
      score += Math.min((superBalance / benchmark) * 25, 25);
    }
    
    // Insurance score (20 points)
    const insuranceAnalysis = getInsuranceAnalysis();
    const insuranceScore = Math.max(0, 20 - (insuranceAnalysis.recommendations.length * 7));
    score += insuranceScore;
    
    // Debt score (25 points)
    const highInterestDebt = getHighInterestDebtAnalysis();
    if (!highInterestDebt) {
      score += 25;
    } else {
      score += Math.max(0, 25 - Math.min(highInterestDebt.totalBalance / 1000, 25));
    }
    
    // Savings rate (10 points) - includes savings/investments + surplus
    score += Math.min(savingsRate / 2, 10); // Up to 10 points for 20% savings rate
    
    return Math.min(Math.round(score), 100);
  };

  // Get what's needed for 100/100 score
  const getScoreRequirements = () => {
    const requirements = [];
    const currentScore = calculateHealthScore();
    
    if (currentScore >= 100) return ["You already have a perfect financial health score! 🎉"];
    
    // Income requirements
    const incomeData = getIncomePercentile();
    if (incomeData.percentile < 80 && annualIncome < nationalAverage) {
      requirements.push(`Increase income to top 20% (${nationalAverage.toLocaleString()}+ annually)`);
    }
    
    // Super requirements
    if (age && superBalance) {
      const benchmarks = { 25: 30000, 30: 60000, 35: 110000, 40: 180000, 45: 270000, 50: 390000, 55: 550000, 60: 750000, 65: 1000000 };
      const closestAge = Object.keys(benchmarks).map(Number).reduce((prev, curr) => 
        Math.abs(curr - age) < Math.abs(prev - age) ? curr : prev
      );
      const benchmark = benchmarks[closestAge as keyof typeof benchmarks];
      if (superBalance < benchmark) {
        requirements.push(`Increase super to ${benchmark.toLocaleString()} (age ${age} benchmark)`);
      }
    }
    
    // Insurance requirements
    const insuranceAnalysis = getInsuranceAnalysis();
    insuranceAnalysis.recommendations.forEach(rec => {
      requirements.push(`Get ${rec.type} coverage`);
    });
    
    // Debt requirements
    const highInterestDebt = getHighInterestDebtAnalysis();
    if (highInterestDebt) {
      requirements.push(`Eliminate all high-interest debt ($${highInterestDebt.totalBalance.toLocaleString()})`);
    }
    
    // Savings requirements
    if (savingsRate < 20) {
      requirements.push(`Achieve 20% savings rate (currently ${savingsRate.toFixed(1)}%)`);
    }
    
    return requirements;
  };

  const healthScore = calculateHealthScore();
  const incomeData = getIncomePercentile();
  const highInterestDebt = getHighInterestDebtAnalysis();
  const insuranceAnalysis = getInsuranceAnalysis();
  const scoreRequirements = getScoreRequirements();

  console.log('FullFinancialHealthCheck Debug:', {
    debtDetails,
    highInterestDebt,
    debtDetailsLength: debtDetails?.length || 0
  });

  // Determine risk profile
  const riskProfile = age && age < 40 ? 'Growth' : age && age < 55 ? 'Balanced' : 'Conservative';

  // KPI calculations
  const postcodeIncomeRatio = ((annualIncome / postcodeMedian) * 100).toFixed(0);
  const nationalIncomeRatio = ((annualIncome / nationalMedian) * 100).toFixed(0);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
          Your Complete Financial Health Check
        </h2>
        <p className="text-muted-foreground mt-2">
          Comprehensive analysis based on Australian financial benchmarks
        </p>
      </div>

      {/* Financial Health Score - Only show when assessment is complete */}
      {goals.includes('Full Financial Health Check') && (
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              Financial Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Progress value={healthScore} className="flex-1" />
            <span className="text-2xl font-bold text-emerald-600">{healthScore}/100</span>
          </div>
          <div className="text-sm text-emerald-800 mb-4">
            {healthScore >= 80 && "Excellent financial health! You're on track for a secure financial future."}
            {healthScore >= 60 && healthScore < 80 && "Good financial health with room for improvement in key areas."}
            {healthScore >= 40 && healthScore < 60 && "Moderate financial health. Focus on the action items below."}
            {healthScore < 40 && "Your financial health needs attention. Start with high-priority items."}
          </div>
          
          {healthScore < 100 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">To achieve 100/100 score:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {scoreRequirements.map((requirement, index) => (
                  <li key={index}>• {requirement}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">vs Postcode</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{postcodeIncomeRatio}%</p>
            <p className="text-xs text-muted-foreground">of postcode median</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">vs National</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{nationalIncomeRatio}%</p>
            <p className="text-xs text-muted-foreground">of national median</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-muted-foreground">Savings Rate</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {savingsRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">target: 10-20%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-muted-foreground">Age</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{age || 'N/A'}</p>
            <p className="text-xs text-muted-foreground">years old</p>
          </CardContent>
        </Card>
      </div>

      {/* Section 1: Income Analysis */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Income Analysis
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-emerald-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-emerald-800 mb-2">
              <strong>An income analysis is important because it helps you understand the sources, stability, and growth potential of your earnings.</strong> 
              By breaking down where your income comes from—such as wages, investments, or side businesses—you can evaluate how reliable and sustainable each stream is. 
              This analysis also highlights opportunities to increase earnings, diversify income sources, or plan for periods of irregular cash flow. 
              Understanding your income in detail allows you to align spending, saving, and investing decisions with your financial capacity, ensuring you live within your means while still building toward long-term financial security.
            </p>
            <p className="text-sm text-emerald-800">
              Ultimately, a personal income analysis allows you to make better financial decisions, plan for the future with confidence, and build long-term financial security.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Annual Income</p>
                <p className="text-2xl font-bold">${annualIncome.toLocaleString()}</p>
                <Badge variant="secondary" className="mt-1">
                  {incomeData.level}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Net Income</p>
                <p className="text-2xl font-bold">${monthlyNetIncome.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">after tax</p>
              </div>
            </div>

            <IncomeComparisonChart userIncome={annualIncome} postcode={postcode} />
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Understanding Your Income Position</h4>
              <p className="text-sm text-blue-800">
                Your income of ${annualIncome.toLocaleString()} puts you in the {incomeData.level.toLowerCase()} range nationally. 
                The <strong>median</strong> represents the middle point where half earn more and half earn less, 
                giving a better picture than the average (which can be skewed by very high earners).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Budget Analysis */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Budget Analysis
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              const event = new CustomEvent('selectGoal', { detail: 'Set a budget' });
              window.dispatchEvent(event);
            }}>
              Budget Planner <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <BudgetRecap 
            totalMonthlyNetIncome={monthlyNetIncome}
            totalMonthlyExpenses={monthlyExpenses}
            expenseItems={expenseItems}
          />


        </CardContent>
      </Card>

      {/* Section 3: Superannuation Health */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <PiggyBank className="h-5 w-5 text-blue-600" />
              Superannuation Health
            </div>
            <Link to="/maximise-super">
              <Button variant="outline" size="sm">
                Super Calculator <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-blue-800">
              <strong>Superannuation is one of Australia's most powerful wealth-building tools.</strong> It's typically the most tax-effective investment vehicle available, with contributions taxed at just 15% (compared to your marginal tax rate of up to 47%) and investment earnings also taxed at only 15%. In retirement, withdrawals are generally tax-free after age 60. Building a strong super balance is crucial for maintaining your lifestyle in retirement.
            </p>
          </div>
          
          <SuperKPICards
            currentAge={age}
            currentBalance={superBalance}
            currentSalary={annualIncome}
          />

          <SuperBenchmarkChart currentAge={age} currentBalance={superBalance} />
          
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold text-blue-900">Understanding Your Superannuation Position</h4>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>Current vs Benchmark:</strong> Your balance compared to the QSuper benchmark for your age group, indicating if you're on track.</p>
              <p><strong>At Retirement (Age 67):</strong> Projected balance using current 11.5% employer contributions and 7% annual growth. The 4% rule suggests you can safely withdraw 4% annually in retirement.</p>
              <p><strong>Retirement Readiness:</strong> Whether your projected super will provide 70% of your current income (the recommended retirement income target).</p>
              <p><strong>+10% Salary Sacrifice Impact:</strong> Adding 10% of your salary to super would boost your retirement income by ${age && superBalance ? `${((annualIncome * 0.10 * Math.pow(1.07, Math.max(67 - age, 0)) * 0.04) / 1000).toFixed(0)}k` : 'N/A'} annually. Out of a ${(annualIncome * 0.10 / 12).toLocaleString()}/month contribution, approximately ${Math.round((annualIncome * 0.10 / 12) * (annualIncome > 120000 ? 0.37 : annualIncome > 45000 ? 0.30 : 0.19)).toLocaleString()} would be tax savings, making your actual cost only ${Math.round((annualIncome * 0.10 / 12) * (1 - (annualIncome > 120000 ? 0.37 : annualIncome > 45000 ? 0.30 : 0.19))).toLocaleString()}/month.</p>
            </div>
          </div>

          {/* 4% Rule Explanation */}
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Target className="h-5 w-5" />
              The 4% Rule - Your Retirement Income Calculator
            </h4>
            <div className="space-y-3">
              <p className="text-sm text-blue-800">
                <strong>The 4% rule is a time-tested retirement withdrawal strategy.</strong> It suggests you can safely withdraw 4% of your investment portfolio annually in retirement without running out of money over a 30-year period. This rule is based on historical market performance and inflation data.
              </p>
              
              {superBalance && superBalance > 0 && age ? (() => {
                // Calculate projections using same logic as SuperKPICards
                const retirementYears = Math.max(67 - age, 0);
                const monthlyGrowthRate = 0.07 / 12;
                const months = retirementYears * 12;
                const annualEmployerContrib = annualIncome * 0.115;
                
                const currentGrowthFactor = superBalance > 0 ? Math.pow(1 + monthlyGrowthRate, months) : 1;
                const annuityFactor = months > 0 ? ((Math.pow(1 + monthlyGrowthRate, months) - 1) / monthlyGrowthRate) : 0;
                
                const futureValueCurrent = superBalance * currentGrowthFactor + (annualEmployerContrib / 12) * annuityFactor;
                const additionalContrib = annualIncome * 0.10;
                const totalAnnualContrib = annualEmployerContrib + additionalContrib;
                const futureValueExtra = superBalance * currentGrowthFactor + (totalAnnualContrib / 12) * annuityFactor;
                
                const currentAnnualIncome = superBalance * 0.04;
                const projectedAnnualIncome = futureValueCurrent * 0.04;
                const projectedAnnualIncomeExtra = futureValueExtra * 0.04;
                
                return (
                  <div className="bg-white p-3 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-blue-600 font-medium">Current Balance (4% Rule)</p>
                        <p className="text-lg font-bold text-blue-900">${currentAnnualIncome.toLocaleString()}/year</p>
                        <p className="text-xs text-blue-600">≈ ${Math.round(currentAnnualIncome / 12).toLocaleString()}/month</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600 font-medium">At Retirement (Age 67)</p>
                        <p className="text-lg font-bold text-emerald-600">${projectedAnnualIncome.toLocaleString()}/year</p>
                        <p className="text-xs text-blue-600">≈ ${Math.round(projectedAnnualIncome / 12).toLocaleString()}/month</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600 font-medium">With +10% Salary Sacrifice</p>
                        <p className="text-lg font-bold text-purple-600">${projectedAnnualIncomeExtra.toLocaleString()}/year</p>
                        <p className="text-xs text-blue-600">≈ ${Math.round(projectedAnnualIncomeExtra / 12).toLocaleString()}/month</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-xs text-blue-700">
                        <strong>Additional income from +10% contributions:</strong> ${(projectedAnnualIncomeExtra - projectedAnnualIncome).toLocaleString()}/year more in retirement
                      </p>
                    </div>
                  </div>
                );
              })() : (
                <div className="bg-white p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 italic">
                    Enter your super balance and age in the assessment to see your potential annual retirement income using the 4% rule.
                  </p>
                </div>
              )}
              
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>How it works:</strong> If you have $1 million in super, you could withdraw $40,000 annually (4%) while preserving your capital for inflation and market fluctuations.</p>
                <p><strong>Why 4%:</strong> This rate historically allows your portfolio to grow enough to maintain purchasing power while providing steady income throughout retirement.</p>
                <p><strong>Australian context:</strong> Combined with Age Pension (if eligible), this can provide a comfortable retirement income for most Australians.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Insurance Protection */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
            <Shield className="h-5 w-5 text-purple-600" />
            Insurance Protection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-purple-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-purple-800">
              <strong>Insurance is your financial safety net.</strong> Life insurance, income protection, and health insurance protect you and your family from financial catastrophe when unexpected events occur. Without adequate coverage, a serious illness or accident could destroy years of financial progress in an instant.
            </p>
          </div>
          
          <div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Current Coverage</p>
              <div className="flex flex-wrap gap-2">
                {insurances.map((insurance, index) => (
                  <Badge key={index} variant="secondary">{insurance}</Badge>
                ))}
                {insurances.length === 0 && (
                  <p className="text-muted-foreground italic">No insurance coverage selected</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Essential Insurance Types</h4>
              <p className="text-sm text-blue-800 mb-2">
                These insurance types provide critical financial protection for you and your family.
              </p>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• <strong>Life Insurance:</strong> Pays off debts, replaces income, and funds children's education if you pass away unexpectedly</li>
                <li>• <strong>Income Protection:</strong> Replaces up to 75% of your income if illness or injury prevents you from working</li>
                <li>• <strong>TPD Insurance:</strong> Provides a lump sum if you become totally and permanently disabled, covering medical costs and lifestyle modifications</li>
                <li>• <strong>Private Health Insurance:</strong> Avoids Medicare Levy Surcharge and provides faster access to medical treatment when you need it most</li>
                <li>• <strong>Family Stability:</strong> Ensures your dependents can maintain their lifestyle</li>
              </ul>
            </div>

            {insuranceAnalysis.recommendations.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-red-900">Coverage Gaps Identified</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://www.comparethemarket.com.au/insurance/', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Compare
                  </Button>
                </div>
                {insuranceAnalysis.recommendations.map((gap, index) => (
                  <div key={index} className="mb-2">
                    <p className="font-medium text-red-800">{gap.type}</p>
                    <p className="text-sm text-red-700">{gap.reason}</p>
                  </div>
                ))}
              </div>
            )}

            {insuranceAnalysis.needsPrivateHealth && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">Medicare Levy Surcharge Alert</h4>
                <p className="text-sm text-orange-800">
                  With an income of ${annualIncome.toLocaleString()}, you're above the Medicare Levy Surcharge threshold 
                  of ${insuranceAnalysis.medicareThreshold.toLocaleString()}. Without private health insurance, you'll pay 
                  an additional ${insuranceAnalysis.surchargeAmount.toLocaleString()} in Medicare Levy Surcharge.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Debt Strategy */}
      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
            <TrendingDown className="h-5 w-5 text-red-600" />
            Debt Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {highInterestDebt && (
            <div className="bg-red-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-red-800">
                <strong>High-interest debt is wealth destruction in action.</strong> Credit cards and personal loans typically charge 15-25% interest, making them impossible to outpace with investments. Eliminating high-interest debt provides a guaranteed return equal to the interest rate - often better than any investment you could make.
              </p>
            </div>
          )}
          
          {!highInterestDebt && (
            <div className="bg-green-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-green-800">
                <strong>Great news - no high-interest debt detected!</strong> 
                Focus on your mortgage paydown strategy and building your investment portfolio for long-term wealth creation.
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Debt Portfolio</h3>
            <Button variant="outline" size="sm" onClick={() => {
              const event = new CustomEvent('selectGoal', { detail: 'Reduce debt' });
              window.dispatchEvent(event);
            }}>
              Debt Calculator <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <DebtSummaryTable
            debtDetails={debtDetails}
            monthlySurplus={monthlySurplus}
          />

          {highInterestDebt && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-400">
                  Immediate Action Required
                </Badge>
              </div>
              <p className="text-sm text-yellow-800 mb-3">
                <strong>High-interest debt is wealth destruction in action!</strong> With ${highInterestDebt.totalBalance.toLocaleString()} in high-interest debt at {highInterestDebt.weightedRate.toFixed(1)}% average rate, you're bleeding money every month. Stop investing, cut up the credit cards, and attack this debt with gazelle intensity. Every dollar thrown at this debt is a <strong>guaranteed {highInterestDebt.weightedRate.toFixed(1)}% return</strong> - better than any investment! Use the debt snowball method: list all debts smallest to largest, pay minimums on all, then throw every extra penny at the smallest debt until it's gone. This isn't about math, it's about changing behavior and building momentum!
              </p>
              {generateSummary && (
                 <div className="space-y-3">
                   <Button 
                     onClick={() => {
                       setShowToughLove(!showToughLove);
                       if (!showToughLove && generateSummary) {
                         generateSummary({ personality: 'dave_ramsey' });
                       }
                     }}
                     variant="destructive"
                     size="sm"
                     disabled={isGeneratingSummary}
                     className="w-full"
                   >
                     {isGeneratingSummary ? (
                       <>
                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                         Getting tough love advice...
                       </>
                     ) : (
                       showToughLove ? "Hide Tough Love Strategy" : "Get Tough Love Debt Strategy"
                     )}
                   </Button>
                   
                   {/* Display shortened AI Summary only when button is selected and AI has responded */}
                   {showToughLove && aiSummary && !isGeneratingSummary && (aiSummary.toLowerCase().includes('debt') || aiSummary.toLowerCase().includes('ramsey') || aiSummary.toLowerCase().includes('gazelle')) && (
                     <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                       <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                         <TrendingDown className="h-4 w-4" />
                         Your Tough Love Debt Strategy
                       </h4>
                       <div className="text-sm text-red-800">
                         <p className="font-medium">
                           Stop the financial bleeding! You have ${highInterestDebt.totalBalance.toLocaleString()} in high-interest debt at {highInterestDebt.weightedRate.toFixed(1)}% - that's money being stolen from your future every single month. Cut up the credit cards, create a bare-bones budget, and attack the smallest debt first with every spare dollar. This is an emergency, not a lifestyle choice. No investing, no fancy purchases until this debt is GONE!
                         </p>
                       </div>
                     </div>
                   )}
                 </div>
              )}
            </div>
          )}
          
          {(() => {
            // Check if user is under 50 and doesn't have a mortgage
            const hasMortgage = debtDetails.some(debt => 
              debt.type?.toLowerCase().includes('mortgage') || 
              debt.type?.toLowerCase().includes('home loan')
            );
            const isUnder50 = age && age < 50;
            
            if (isUnder50 && !hasMortgage) {
              // Show Home Buying section instead of mortgage payoff
              const housingExpenses = calculateMonthlyAmount(
                expenseItems.filter(item => 
                  item.category === 'Housing' || 
                  item.category === 'Rent' ||
                  item.category === 'Utilities'
                )
              );
              
              // Calculate available for housing (current housing + surplus + savings)
              const availableForHousing = housingExpenses + Math.max(0, monthlySurplus) + savingsAndInvestmentsAmount;
              
              // Calculate time to save 5% deposit based on budget surplus
              const depositTarget = 50000; // 5% of roughly $1M house
              const monthlySavingsPotential = Math.max(0, monthlySurplus) + savingsAndInvestmentsAmount;
              const monthsToSave5Percent = monthlySavingsPotential > 0 ? depositTarget / monthlySavingsPotential : 0;
              
              return (
                <Card className="w-full mt-4">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="h-6 w-6 text-blue-600" />
                      <CardTitle>Home Buying Calculator 🏠</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                      const event = new CustomEvent('selectGoal', { detail: 'Buy a house' });
                      window.dispatchEvent(event);
                    }}>
                      Full Calculator <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Borrowing Capacity Section */}
                    <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                      <h3 className="font-semibold text-lg text-blue-900">Your Borrowing Capacity (30% Rule)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Maximum Monthly Payment:</p>
                          <p className="text-2xl font-bold text-green-600">
                            ${availableForHousing.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Maximum Purchase Price:</p>
                          <p className="text-2xl font-bold text-blue-600">
                            ${((availableForHousing * 300) + 100000).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </p>
                          <p className="text-xs text-gray-500">Based on 30-year loan at 6.5%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Amount Available for Housing:</p>
                          <p className="text-2xl font-bold text-green-600">
                            ${availableForHousing.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Savings Timeline */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-3">Deposit Savings Timeline</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Time to Save 5% Deposit ($50k):</p>
                          <p className="text-xl font-bold text-green-600">
                            {monthsToSave5Percent > 0 ? `${Math.ceil(monthsToSave5Percent)} months` : 'Improve savings first'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Current Monthly Savings Potential:</p>
                          <p className="text-xl font-bold text-green-600">
                            ${monthlySavingsPotential.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tips to Improve Buying Power */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">Tips to Improve Your Buying Power</h3>
                      
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>💡 Research first home buyer grants:</strong> You could be eligible for up to $10,000 in grants depending on your state.
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                        <p className="text-sm text-blue-800">
                          <strong>🏘️ Consider suburbs 15-20km from city center:</strong> Property prices are typically 30-40% lower in these areas.
                        </p>
                      </div>
                      
                      <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                        <p className="text-sm text-green-800">
                          <strong>📋 Get pre-approval before house hunting:</strong> This helps you know your exact budget and strengthens your offers.
                        </p>
                      </div>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h3 className="font-semibold text-indigo-900 mb-2">This Week's Action Items</h3>
                      <ul className="space-y-1 text-sm text-indigo-800">
                        <li>• Open a dedicated house deposit savings account</li>
                        <li>• Set up automatic transfer of ${Math.max(500, Math.floor(monthlySavingsPotential)).toLocaleString()} per month</li>
                        <li>• Research first home buyer grants in your state</li>
                        <li>• Get pre-approval from multiple lenders to compare rates</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            } else {
              // Show regular debt payoff visualization
              return <DebtPayoffVisualization debtDetails={debtDetails} monthlyIncome={monthlyIncome} />;
            }
          })()}
        </CardContent>
      </Card>

      {/* Section 6: Investment Strategy */}
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">6</span>
              <Target className="h-5 w-5 text-indigo-600" />
              Investment Strategy
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              const event = new CustomEvent('selectGoal', { detail: 'Grow investments' });
              window.dispatchEvent(event);
            }}>
              Investment Growth <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-indigo-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-indigo-800">
              <strong>Investing grows your wealth through compound returns.</strong> After eliminating high-interest debt and building an emergency fund, investing allows your money to work for you. The key is starting early, staying consistent, and choosing investments that match your risk tolerance and time horizon.
            </p>
          </div>
          
          <InvestmentRiskProfile
            riskProfile={riskProfile}
            hasHighInterestDebt={!!highInterestDebt}
          />

          {assets.length > 0 && (
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h4 className="font-semibold text-indigo-900 mb-3">Debt Recycling Strategy</h4>
              <p className="text-sm text-indigo-800 mb-4">
                Since you own assets, debt recycling could convert non-deductible debt into tax-deductible debt while building your investment portfolio.
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-indigo-200">
                      <th className="text-left p-2 text-indigo-900">Strategy</th>
                      <th className="text-left p-2 text-indigo-900">How It Works</th>
                      <th className="text-left p-2 text-indigo-900">Tax Benefit</th>
                      <th className="text-left p-2 text-indigo-900">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody className="text-indigo-800">
                    <tr className="border-b border-indigo-100">
                      <td className="p-2 font-medium">Property Equity Access</td>
                      <td className="p-2">Use property equity to invest in shares/managed funds</td>
                      <td className="p-2">Interest becomes tax-deductible</td>
                      <td className="p-2">Medium</td>
                    </tr>
                    <tr className="border-b border-indigo-100">
                      <td className="p-2 font-medium">Debt Conversion</td>
                      <td className="p-2">Gradually replace non-deductible debt with investment debt</td>
                      <td className="p-2">{annualIncome > 120000 ? '37%' : annualIncome > 45000 ? '30%' : '19%'} tax saving on interest</td>
                      <td className="p-2">Medium</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Investment Loan</td>
                      <td className="p-2">Borrow against assets to purchase income-producing investments</td>
                      <td className="p-2">Full interest + management fees deductible</td>
                      <td className="p-2">Higher</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs text-yellow-800">
                  <strong>Important:</strong> Debt recycling involves investment risk and complex tax implications. 
                  Seek professional financial and tax advice before implementing any strategy. 
                  Investment returns are not guaranteed and you could lose money.
                </p>
              </div>
            </div>
          )}

          <PostDebtInvestmentVisualization 
            debtDetails={debtDetails}
            monthlyIncome={monthlyIncome}
          />

          {/* Debt Recycling Section - Only show if they have shares/ETFs */}
          {(() => {
            const hasSharesOrETFs = assets.some(asset => 
              asset.type?.toLowerCase().includes('shares') || 
              asset.type?.toLowerCase().includes('etf') ||
              asset.type?.toLowerCase().includes('stock') ||
              asset.type?.toLowerCase().includes('investment')
            );
            
            console.log('Debt Recycling Debug:', {
              assets,
              hasSharesOrETFs,
              assetTypes: assets.map(asset => asset.type)
            });
            
            if (hasSharesOrETFs) {
              // Calculate 10-year portfolio value example
              const monthlyInvestment = savingsAndInvestmentsAmount + Math.max(0, monthlySurplus);
              const annualReturn = 0.07;
              const years = 10;
              const portfolioValue = monthlyInvestment * 12 * years + (monthlyInvestment * 12 * ((Math.pow(1 + annualReturn, years) - 1) / annualReturn));
              
              // Calculate potential debt recycling benefit
              const loanAmount = Math.min(portfolioValue * 0.8, 500000); // 80% LVR, max $500k example
              const interestRate = 0.065;
              const annualInterest = loanAmount * interestRate;
              const taxBracket = annualIncome > 120000 ? 0.37 : annualIncome > 45000 ? 0.30 : 0.19;
              const annualTaxSaving = annualInterest * taxBracket;

              return (
                <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Debt Recycling Strategy for Your Portfolio
                  </h3>
                  
                  <div className="bg-white p-4 rounded-lg mb-4">
                    <p className="text-sm text-purple-800 mb-3">
                      <strong>What is debt recycling?</strong> It's converting non-deductible debt (like your mortgage) 
                      into tax-deductible investment debt. You borrow against your existing investments to buy more 
                      investments, making the interest tax-deductible while potentially accelerating wealth creation.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">Your Numbers</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>10-Year Portfolio Value:</span>
                          <span className="font-semibold">${portfolioValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Potential Loan Amount (80% LVR):</span>
                          <span className="font-semibold">${loanAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Annual Interest Cost:</span>
                          <span className="font-semibold">${annualInterest.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2">Tax Benefits</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Your Tax Bracket:</span>
                          <span className="font-semibold">{(taxBracket * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Annual Tax Saving:</span>
                          <span className="font-semibold text-green-700">${annualTaxSaving.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Effective Interest Rate:</span>
                          <span className="font-semibold text-green-700">{((interestRate * (1 - taxBracket)) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h4 className="font-semibold text-amber-800 mb-2">⚠️ Important Considerations</h4>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• Investment returns are not guaranteed - you could lose money</li>
                      <li>• Interest must still be paid regardless of investment performance</li>
                      <li>• Seek professional tax and financial advice before implementing</li>
                      <li>• Consider your risk tolerance and cash flow carefully</li>
                    </ul>
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </CardContent>
      </Card>

      {/* Section 7: Tailored Financial Resources */}
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">7</span>
            📚 Your Personalized Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-orange-800">
              <strong>Knowledge is power, but the right knowledge at the right time is wealth.</strong> 
              Based on your financial position, here are the most relevant resources to accelerate your progress.
            </p>
          </div>

          {(() => {
            const hasMortgage = debtDetails.some(debt => 
              debt.type?.toLowerCase().includes('mortgage') || 
              debt.type?.toLowerCase().includes('home loan')
            );
            const hasHighInterestDebt = debtDetails.some(debt => parseFloat(debt.interestRate || '0') > 8);
            const isUnder35 = age && age < 35;

            // Determine focus area and get tailored resources
            const getFocusArea = () => {
              if (hasHighInterestDebt) return "debt";
              if (savingsRate < 10) return "budget";
              if (!hasMortgage && isUnder35) return "home";
              if (hasMortgage) return "mortgage";
              return "invest";
            };

            const focusArea = getFocusArea();

            const getResourcesByFocus = () => {
              switch (focusArea) {
                case "debt":
                  // Calculate total monthly debt payments
                  const totalDebtPayments = debtDetails.reduce((total, debt) => {
                    return total + (parseFloat(debt.repayments) || 0);
                  }, 0);
                  
                  // Only show National Debt Helpline if debt repayments are 20%+ of income
                  const debtPercentage = monthlyIncome > 0 ? (totalDebtPayments / monthlyIncome) * 100 : 0;
                  const shouldShowDebtHelpline = debtPercentage >= 20;
                  
                  const baseResources = [
                    { type: "📖", title: "The Barefoot Investor", author: "Scott Pape", description: "Australia's #1 debt elimination strategy", url: "#" },
                    { type: "🎧", title: "My Millennial Money", author: "Glen James", description: "Practical budgeting and debt payoff tips", url: "#" },
                    { type: "📊", title: "MoneySmart Budget Planner", author: "Government Tool", description: "Excel-based debt tracking", url: "#" }
                  ];
                  
                  if (shouldShowDebtHelpline) {
                    baseResources.splice(2, 0, { type: "🏛️", title: "National Debt Helpline", author: "Free Service", description: "Professional financial counselling", url: "https://ndh.org.au" });
                  }
                  
                  return {
                    title: "🚨 Priority: Eliminate High-Interest Debt",
                    resources: baseResources
                  };
                case "budget":
                  return {
                    title: "💰 Focus: Budget Mastery & Savings",
                    resources: [
                      { type: "📖", title: "The Barefoot Investor", author: "Scott Pape", description: "Simple bucket budgeting system", url: "#" },
                      { type: "🎧", title: "My Millennial Money", author: "Glen James", description: "Includes budget tools and net worth tracker", url: "#" },
                      { type: "📊", title: "MoneySmart Budget Planner", author: "Government Excel", description: "Free, effective planning tool", url: "#" },
                      { type: "🎧", title: "She's On The Money", author: "Victoria Devine", description: "Financial empowerment for young Australians", url: "#" }
                    ]
                  };
                case "home":
                  return {
                    title: "🏠 Goal: Home Ownership",
                    resources: [
                      { type: "📖", title: "The Psychology of Money", author: "Morgan Housel", description: "Right mindset for long-term saving", url: "#" },
                      { type: "🌐", title: "First Home Owner Grants", author: "Government", description: "State-by-state grant eligibility", url: "https://www.firsthome.gov.au" },
                      { type: "📄", title: "House Deposit Saving Guide", author: "Canstar", description: "Proven deposit acceleration strategies", url: "#" },
                      { type: "🎧", title: "She's On The Money", author: "Victoria Devine", description: "Young adult financial guidance", url: "#" }
                    ]
                  };
                case "mortgage":
                  return {
                    title: "🏡 Priority: Mortgage Optimization",
                    resources: [
                      { type: "📄", title: "Paying Off Your Mortgage Faster", author: "MoneySmart", description: "Government-backed strategies", url: "https://moneysmart.gov.au/home-loans/paying-off-your-mortgage-faster" },
                      { type: "🎧", title: "My Millennial Money", author: "Glen James", description: "Practical mortgage strategy episodes", url: "#" },
                      { type: "🌐", title: "Strong Money Australia", author: "Dave Gow", description: "Early retirement via mortgage payoff", url: "#" },
                      { type: "📊", title: "Bank Repayment Calculator", author: "CommBank", description: "Calculate extra payment impact", url: "https://www.commbank.com.au/digital/home-buying/calculator/property-repayment" }
                    ]
                  };
                case "invest":
                  return {
                    title: "📈 Focus: Investment Growth",
                    resources: [
                      { type: "🌐", title: "Passive Investing Australia", author: "Community", description: "ETFs and index funds for Aussies", url: "#" },
                      { type: "📖", title: "The Psychology of Money", author: "Morgan Housel", description: "Investment mindset fundamentals", url: "#" },
                      { type: "🎧", title: "FIRE & Chill Podcast", author: "Archives", description: "Deep dives into financial independence", url: "#" },
                      { type: "🎓", title: "Robert Shiller's Financial Markets", author: "Yale via YouTube", description: "Academic but digestible theory", url: "https://www.youtube.com/playlist?list=PLEDC55106E0BA18FC" }
                    ]
                  };
                default:
                  return {
                    title: "📚 General Financial Education",
                    resources: [
                      { type: "📖", title: "The Barefoot Investor", author: "Scott Pape", description: "Best starting point for any goal", url: "#" },
                      { type: "🌐", title: "MoneySmart Website", author: "ASIC", description: "Trustworthy, unbiased guidance", url: "https://moneysmart.gov.au" },
                      { type: "🎧", title: "She's On The Money", author: "Victoria Devine", description: "Accessible financial tips", url: "#" }
                    ]
                  };
              }
            };

            const resourceSet = getResourcesByFocus();

            return (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-orange-100 to-amber-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-3">{resourceSet.title}</h4>
                  <div className="grid gap-3">
                    {resourceSet.resources.map((item, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-orange-200 hover:shadow-sm transition-shadow">
                        <div className="flex items-start gap-3">
                          <span className="text-lg flex-shrink-0">{item.type}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900">{item.title}</p>
                              {item.url !== "#" && (
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                  View
                                </Button>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{item.author}</p>
                            <p className="text-xs text-gray-500">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Section 8: Financial Action Plan */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">8</span>
            Your Financial Action Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-emerald-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-emerald-800">
              <strong>Knowledge without action is worthless.</strong> 
              Your financial health check reveals the areas that need attention. The key to building wealth 
              is taking consistent action on these priorities, starting with the highest-impact items first.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <p className="font-medium">Create a comprehensive budget</p>
                <Button variant="outline" size="sm" onClick={() => {
                  const event = new CustomEvent('selectGoal', { detail: 'Set a budget' });
                  window.dispatchEvent(event);
                }}>
                  Start Budget <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              {highInterestDebt && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <p className="font-medium">Eliminate high-interest debt immediately</p>
                  <Button variant="outline" size="sm" onClick={() => {
                    const event = new CustomEvent('selectGoal', { detail: 'Reduce debt' });
                    window.dispatchEvent(event);
                  }}>
                    Debt Plan <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
              
              {insuranceAnalysis.recommendations.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <p className="font-medium">Address insurance coverage gaps</p>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <p className="font-medium">Boost superannuation contributions</p>
                <Link to="/maximise-super">
                  <Button variant="outline" size="sm">
                    Super Calc <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {!highInterestDebt && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                  <p className="font-medium">Start investing for long-term growth</p>
                  <Button variant="outline" size="sm" onClick={() => {
                    const event = new CustomEvent('selectGoal', { detail: 'Grow investments' });
                    window.dispatchEvent(event);
                  }}>
                    Invest <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-emerald-50 p-4 rounded-lg">
              <h4 className="font-semibold text-emerald-900 mb-2">Ready to Take Action?</h4>
              <p className="text-sm text-emerald-800 mb-3">
                Click any goal below to get started, then return to this comprehensive summary.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => {
                  const event = new CustomEvent('selectGoal', { detail: 'Set a budget' });
                  window.dispatchEvent(event);
                }}>
                  Budget Planner
                </Button>
                <Link to="/maximise-super">
                  <Button size="sm" variant="outline">Super Calculator</Button>
                </Link>
                <Link to="/pay-off-home-loan">
                  <Button size="sm" variant="outline">Debt Calculator</Button>
                </Link>
                <Button size="sm" variant="outline" onClick={() => {
                  const event = new CustomEvent('selectGoal', { detail: 'Grow investments' });
                  window.dispatchEvent(event);
                }}>
                  Investment Growth
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Financial Assistant */}
      <Card>
        <CardContent className="p-8">
          <HealthCheckAISearchSection 
            assessmentData={{
              age,
              postcode,
              superBalance,
              debtTypes,
              debtDetails,
              incomeSources,
              expenseItems,
              goals,
              insurances,
              assets
            }}
            onGoalSuggested={(goal) => {
              const event = new CustomEvent('selectGoal', { detail: goal });
              window.dispatchEvent(event);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default FullFinancialHealthCheck;
