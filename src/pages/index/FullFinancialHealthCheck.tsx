
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, Shield, Home, PiggyBank, Target, BarChart3, DollarSign, Calendar, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import IncomeComparisonChart from "./components/IncomeComparisonChart";
import SuperBenchmarkChart from "./components/SuperBenchmarkChart";
import DebtPayoffVisualization from "./components/DebtPayoffVisualization";
import { calculateMonthlyAmount } from "@/lib/financialCalculations";

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
  goals: string[];
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
  goals
}) => {
  // Use the established calculation function for consistency
  const monthlyIncome = calculateMonthlyAmount(incomeSources);
  const annualIncome = monthlyIncome * 12;

  // Australian income benchmarks
  const nationalMedian = 55000;
  const nationalAverage = 85000;
  const postcodeMedian = postcode ? 
    (parseInt(postcode.substring(0, 1)) > 3 ? 45000 : 65000) : nationalMedian;

  // Income analysis with Australian benchmarks
  const getIncomePercentile = () => {
    if (annualIncome >= 180000) return { percentile: 90, level: "Top 10%" };
    if (annualIncome >= 120000) return { percentile: 80, level: "Top 20%" };
    if (annualIncome >= 80000) return { percentile: 65, level: "Above Average" };
    if (annualIncome >= 50000) return { percentile: 50, level: "Median" };
    return { percentile: 30, level: "Below Average" };
  };

  // Super analysis with projections
  const getSuperAnalysis = () => {
    if (!age || !superBalance) return null;
    
    const benchmarks = {
      25: 30000, 30: 60000, 35: 110000, 40: 180000, 45: 270000,
      50: 390000, 55: 550000, 60: 750000, 65: 1000000
    };
    
    const closestAge = Object.keys(benchmarks)
      .map(Number)
      .reduce((prev, curr) => 
        Math.abs(curr - age) < Math.abs(prev - age) ? curr : prev
      );
    
    const currentBenchmark = benchmarks[closestAge as keyof typeof benchmarks];
    const retirementYears = 67 - age;
    
    // Project super at 67 (assuming 7% growth + 9.5% employer contrib)
    const annualEmployerContrib = annualIncome * 0.095;
    const monthlyGrowthRate = 0.07 / 12;
    const months = retirementYears * 12;
    
    // Future value calculation
    const futureValue = superBalance * Math.pow(1 + monthlyGrowthRate, months) +
      (annualEmployerContrib / 12) * ((Math.pow(1 + monthlyGrowthRate, months) - 1) / monthlyGrowthRate);
    
    // Retirement adequacy (typically 10-12x annual income)
    const retirementTarget = annualIncome * 10;
    
    return {
      currentBenchmark,
      projectedAt67: futureValue,
      retirementTarget,
      progress: (superBalance / currentBenchmark) * 100,
      retirementReadiness: (futureValue / retirementTarget) * 100
    };
  };

  // High-interest debt analysis
  const getHighInterestDebtAnalysis = () => {
    const highInterestDebts = debtDetails.filter(debt => 
      ['Credit Card', 'Personal Loan'].includes(debt.type) && parseFloat(debt.balance) > 0
    );
    
    if (highInterestDebts.length === 0) return null;
    
    const totalBalance = highInterestDebts.reduce((sum, debt) => sum + parseFloat(debt.balance), 0);
    const weightedRate = highInterestDebts.reduce((sum, debt) => 
      sum + (parseFloat(debt.balance) * parseFloat(debt.interestRate)), 0
    ) / totalBalance;
    
    // Calculate payoff scenarios
    const minPayment = totalBalance * 0.03; // 3% minimum
    const aggressivePayment = Math.min(monthlyIncome * 0.2, 1000); // 20% of income or $1000
    
    const calculatePayoffTime = (monthlyPayment: number) => {
      let balance = totalBalance;
      let months = 0;
      let totalInterest = 0;
      
      while (balance > 0 && months < 600) { // 50 year cap
        const monthlyInterest = balance * (weightedRate / 100 / 12);
        totalInterest += monthlyInterest;
        balance = balance + monthlyInterest - monthlyPayment;
        months++;
        
        if (balance <= 0) break;
      }
      
      return { months, totalInterest };
    };
    
    const minScenario = calculatePayoffTime(minPayment);
    const aggressiveScenario = calculatePayoffTime(aggressivePayment);
    
    return {
      totalBalance,
      weightedRate,
      minPayment,
      aggressivePayment,
      minScenario,
      aggressiveScenario,
      timeSaved: minScenario.months - aggressiveScenario.months,
      interestSaved: minScenario.totalInterest - aggressiveScenario.totalInterest
    };
  };

  // Insurance adequacy analysis
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
    
    // Medicare Levy Surcharge threshold
    const medicareThreshold = 97000; // Single person threshold 2024-25
    const needsPrivateHealth = annualIncome > medicareThreshold && 
      !insurances.includes("Private Health Insurance");
    
    if (needsPrivateHealth) {
      recommendations.push({
        type: "Private Health Insurance",
        recommended: 2000, // Average annual premium
        reason: `Avoid Medicare Levy Surcharge of ${((annualIncome - medicareThreshold) * 0.015).toLocaleString()}`
      });
    }
    
    return { recommendations, needsPrivateHealth, medicareThreshold };
  };

  // Calculate financial health score
  const calculateHealthScore = () => {
    let score = 0;
    
    // Income score (20 points)
    const incomeData = getIncomePercentile();
    score += Math.min(incomeData.percentile / 100 * 20, 20);
    
    // Super score (25 points)
    const superAnalysis = getSuperAnalysis();
    if (superAnalysis) {
      score += Math.min(superAnalysis.progress / 100 * 25, 25);
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
      score += Math.max(0, 25 - (highInterestDebt.totalBalance / 1000)); // Penalty for high-interest debt
    }
    
    // Investment readiness (10 points)
    const hasInvestments = assets.some(asset => asset.type.toLowerCase().includes('share'));
    if (hasInvestments) score += 10;
    else if (!highInterestDebt) score += 5; // Ready to invest
    
    return Math.min(Math.round(score), 100);
  };

  const healthScore = calculateHealthScore();
  const incomeData = getIncomePercentile();
  const superAnalysis = getSuperAnalysis();
  const highInterestDebt = getHighInterestDebtAnalysis();
  const insuranceAnalysis = getInsuranceAnalysis();

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

      {/* Financial Health Score */}
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
          <div className="text-sm text-emerald-800">
            {healthScore >= 80 && "Excellent financial health! You're on track for a secure financial future."}
            {healthScore >= 60 && healthScore < 80 && "Good financial health with room for improvement in key areas."}
            {healthScore >= 40 && healthScore < 60 && "Moderate financial health. Focus on the action items below."}
            {healthScore < 40 && "Your financial health needs attention. Start with high-priority items."}
          </div>
        </CardContent>
      </Card>

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

        {superAnalysis && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <PiggyBank className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-muted-foreground">Super at 67</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  ${(superAnalysis.projectedAt67 / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-muted-foreground">projected balance</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-muted-foreground">Retirement Ready</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {superAnalysis.retirementReadiness.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">of target needed</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Section 1: Income Analysis */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Income Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Annual Income</p>
              <p className="text-2xl font-bold">${annualIncome.toLocaleString()}</p>
              <Badge variant="secondary" className="mt-1">
                {incomeData.level}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Income Percentile</p>
              <div className="flex items-center gap-2">
                <Progress value={incomeData.percentile} className="flex-1" />
                <span className="text-sm font-medium">{incomeData.percentile}%</span>
              </div>
            </div>
          </div>

          <IncomeComparisonChart userIncome={annualIncome} postcode={postcode} />
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Understanding Income Percentiles</h4>
            <p className="text-sm text-blue-800">
              The <strong>median</strong> income represents the middle point where half earn more and half earn less. 
              Unlike the average (which can be skewed by very high earners), the median gives a better picture 
              of typical Australian earnings. For example, if 10 people earn $30k, $40k, $50k, $60k, $70k, $80k, $90k, $100k, $200k, $500k, 
              the median is $75k but the average is $122k. Your income puts you in the {incomeData.level.toLowerCase()} range.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Superannuation Health */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
            <PiggyBank className="h-5 w-5 text-blue-600" />
            Superannuation Health
          </CardTitle>
          <Link to="/maximise-super">
            <Button variant="outline" size="sm">
              Super Calculator <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-6">
          {superAnalysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold">${superBalance?.toLocaleString()}</p>
                {superFund && <p className="text-sm text-muted-foreground">with {superFund}</p>}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progress vs Benchmark (Age {age})</p>
                <div className="flex items-center gap-2">
                  <Progress value={Math.min(superAnalysis.progress, 100)} className="flex-1" />
                  <span className="text-sm font-medium">{superAnalysis.progress.toFixed(0)}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Benchmark: ${superAnalysis.currentBenchmark.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <SuperBenchmarkChart currentAge={age} currentBalance={superBalance} />

          {superAnalysis && superAnalysis.progress < 100 && (
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">Catch-Up Strategy</h4>
              <p className="text-sm text-orange-800">
                To reach the benchmark by age 60, consider contributing an additional{' '}
                <strong>${Math.round((superAnalysis.currentBenchmark - (superBalance || 0)) / ((60 - (age || 30)) * 12)).toLocaleString()}</strong> per month.
                This could be achieved through salary sacrifice or personal contributions.
              </p>
            </div>
          )}

          {superAnalysis && superAnalysis.retirementReadiness < 100 && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">Retirement Readiness</h4>
              <p className="text-sm text-yellow-800">
                You're projected to have {superAnalysis.retirementReadiness.toFixed(0)}% of the recommended retirement savings. 
                Consider increasing contributions by 10% annually to improve your retirement outlook.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Insurance Protection */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
            <Shield className="h-5 w-5 text-purple-600" />
            Insurance Protection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

          {insuranceAnalysis.recommendations.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-3">Coverage Gaps Identified</h4>
              {insuranceAnalysis.recommendations.map((gap, index) => (
                <div key={index} className="mb-2">
                  <p className="font-medium text-red-800">{gap.type}</p>
                  <p className="text-sm text-red-700">
                    {gap.type === "Private Health Insurance" ? 
                      `Recommended to avoid surcharge: ${gap.reason}` :
                      `Recommended: ${gap.recommended.toLocaleString()} - ${gap.reason}`
                    }
                  </p>
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
                an additional 1.5% tax (${((annualIncome - insuranceAnalysis.medicareThreshold) * 0.015).toLocaleString()}) 
                on your income above the threshold.
              </p>
            </div>
          )}

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">Why Insurance Matters</h4>
            <p className="text-sm text-green-800">
              Insurance protects your family's financial future. Life insurance should typically 
              cover 10x your annual income, while income protection replaces 75% of your salary 
              if you can't work due to illness or injury.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Debt Strategy */}
      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
            <TrendingDown className="h-5 w-5 text-red-600" />
            Debt Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Section 4.1: High-Interest Debt */}
          {highInterestDebt && (
            <div className="space-y-4">
              <h4 className="font-semibold text-red-900">4.1 High-Interest Debt (Priority)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-muted-foreground">Total Balance</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">
                      ${highInterestDebt.totalBalance.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Avg rate: {highInterestDebt.weightedRate.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-muted-foreground">Time Saved</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round(highInterestDebt.timeSaved / 12)} years
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {highInterestDebt.timeSaved % 12} months
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-muted-foreground">Interest Saved</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      ${highInterestDebt.interestSaved.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      vs minimum payments
                    </p>
                  </CardContent>
                </Card>
              </div>

              <DebtPayoffVisualization debtDetails={debtDetails} monthlyIncome={monthlyIncome} />

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h5 className="font-semibold text-yellow-900 mb-2">Debt Elimination Strategy</h5>
                <p className="text-sm text-yellow-800">
                  Focus on paying ${highInterestDebt.aggressivePayment.toLocaleString()} monthly instead of 
                  the minimum ${highInterestDebt.minPayment.toLocaleString()}. This saves you{' '}
                  ${highInterestDebt.interestSaved.toLocaleString()} and gets you debt-free{' '}
                  {Math.round(highInterestDebt.timeSaved / 12)} years sooner.
                </p>
              </div>

              <div className="flex gap-2">
                <Link to="/pay-off-home-loan">
                  <Button variant="outline" size="sm">
                    Debt Calculator <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Section 4.2: Mortgage/Home Loan */}
          <div className="space-y-4">
            <h4 className="font-semibold text-blue-900">
              4.2 {assets.some(a => a.type.toLowerCase().includes('house')) ? 'Home Loan Strategy' : 'Home Buying Strategy'}
            </h4>
            
            {assets.some(a => a.type.toLowerCase().includes('house')) ? (
              <div className="space-y-4">
                {mortgageRate && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-blue-900 mb-2">Mortgage Rate Check</h5>
                    <p className="text-sm text-blue-800">
                      Your current rate: {mortgageRate}%. Current market rates are around 6.0-6.5%. 
                      {mortgageRate > 6.5 ? " Consider refinancing to save thousands annually." : 
                       " Your rate is competitive with current market conditions."}
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Link to="/pay-off-home-loan">
                    <Button variant="outline" size="sm">
                      Mortgage Calculator <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-green-900 mb-2">Home Buying Readiness</h5>
                  <p className="text-sm text-green-800">
                    Based on your income of ${annualIncome.toLocaleString()}, you could potentially 
                    borrow up to ${(annualIncome * 6).toLocaleString()} (using the 6x income rule). 
                    Start saving for a 20% deposit to avoid lenders mortgage insurance.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.location.hash = 'buy-house'}>
                    House Buying Calculator <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Investment Strategy */}
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
            <Target className="h-5 w-5 text-indigo-600" />
            Investment Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {highInterestDebt ? (
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">Priority: Eliminate High-Interest Debt First</h4>
              <p className="text-sm text-red-800">
                Before investing, prioritize paying off high-interest debt. The guaranteed 
                15-25% "return" from paying off credit cards beats most investment returns.
              </p>
            </div>
          ) : (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Ready to Invest</h4>
              <p className="text-sm text-green-800">
                With high-interest debt under control, you're ready to grow your wealth through investments.
              </p>
            </div>
          )}

          {/* Show investment projections regardless of debt status */}
          <div className="space-y-4">
            <h5 className="font-semibold">Investment Options (Post-Debt Elimination)</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h6 className="font-medium mb-2">Conservative (Low Risk)</h6>
                <p className="text-sm text-muted-foreground">
                  High-yield savings, term deposits, government bonds
                </p>
                <p className="text-sm font-medium text-green-600">Expected: 3-5% annually</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h6 className="font-medium mb-2">Balanced (Medium Risk)</h6>
                <p className="text-sm text-muted-foreground">
                  Index funds (VAS, VGS), balanced managed funds
                </p>
                <p className="text-sm font-medium text-blue-600">Expected: 6-8% annually</p>
              </div>
            </div>

            {/* Debt Recycling Strategy */}
            {assets.some(asset => asset.type.toLowerCase().includes('share')) && 
             !debtDetails.some(debt => debt.type.toLowerCase().includes('investment')) && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h5 className="font-semibold text-purple-900 mb-2">Debt Recycling Opportunity</h5>
                <p className="text-sm text-purple-800">
                  You have existing shares but no corresponding investment loans. Consider debt recycling: 
                  Use home equity to invest in income-producing assets while making the interest tax-deductible. 
                  This strategy can reduce your tax burden by approximately{' '}
                  {((monthlyIncome * 12 * 0.3) / 12 * 0.06).toLocaleString()} annually 
                  (based on 6% interest rate and 30% tax bracket).
                </p>
              </div>
            )}

            {/* Investment projection example */}
            {!highInterestDebt && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-2">Investment Projection</h5>
                <p className="text-sm text-blue-800">
                  If you invested $500/month in a balanced portfolio (7% annual return), 
                  you'd have approximately ${((500 * 12 * 20) * 1.4).toLocaleString()} after 20 years 
                  (including compound growth).
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 6: Financial Action Plan */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">6</span>
            Your Financial Action Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            
            {superAnalysis && superAnalysis.progress < 100 && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <p className="font-medium">Boost superannuation contributions</p>
                <Link to="/maximise-super">
                  <Button variant="outline" size="sm">
                    Super Calc <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            )}

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
            <h4 className="font-semibold text-emerald-900 mb-2">Next Steps</h4>
            <p className="text-sm text-emerald-800 mb-3">
              Based on your financial health score of {healthScore}/100, focus on these priority areas 
              to improve your overall financial position.
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FullFinancialHealthCheck;
