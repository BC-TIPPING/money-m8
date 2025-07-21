import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, Shield, Home, PiggyBank, Target } from "lucide-react";
import { Link } from "react-router-dom";

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
  // Calculate total monthly income
  const calculateMonthlyIncome = () => {
    return incomeSources.reduce((total, source) => {
      const amount = parseFloat(source.amount) || 0;
      const multiplier = source.frequency === "Weekly" ? 4.33 : 
                        source.frequency === "Fortnightly" ? 2.17 : 
                        source.frequency === "Annually" ? 1/12 : 1;
      return total + (amount * multiplier);
    }, 0);
  };

  const monthlyIncome = calculateMonthlyIncome();
  const annualIncome = monthlyIncome * 12;

  // Income analysis with Australian benchmarks
  const getIncomePercentile = () => {
    if (annualIncome >= 180000) return { percentile: 90, level: "Top 10%" };
    if (annualIncome >= 120000) return { percentile: 80, level: "Top 20%" };
    if (annualIncome >= 80000) return { percentile: 65, level: "Above Average" };
    if (annualIncome >= 50000) return { percentile: 50, level: "Median" };
    return { percentile: 30, level: "Below Average" };
  };

  // Super analysis
  const getSuperBenchmark = () => {
    if (!age) return null;
    
    const benchmarks = {
      25: 30000,
      30: 60000,
      35: 110000,
      40: 180000,
      45: 270000,
      50: 390000,
      55: 550000,
      60: 750000,
      65: 1000000
    };
    
    const closestAge = Object.keys(benchmarks)
      .map(Number)
      .reduce((prev, curr) => 
        Math.abs(curr - age) < Math.abs(prev - age) ? curr : prev
      );
    
    return benchmarks[closestAge as keyof typeof benchmarks];
  };

  const incomeData = getIncomePercentile();
  const superBenchmark = getSuperBenchmark();
  const superProgress = superBalance && superBenchmark ? (superBalance / superBenchmark) * 100 : 0;

  // Insurance adequacy
  const getInsuranceRecommendations = () => {
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
    return recommendations;
  };

  const insuranceGaps = getInsuranceRecommendations();

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

      {/* Income Analysis */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Income Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Understanding Income Percentiles</h4>
            <p className="text-sm text-blue-800">
              The <strong>median</strong> income represents the middle point where half earn more and half earn less. 
              Unlike the average (which can be skewed by very high earners), the median gives a better picture 
              of typical Australian earnings. Your income puts you in the {incomeData.level.toLowerCase()} range 
              compared to other Australians.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Superannuation Analysis */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-blue-600" />
            Superannuation Health
          </CardTitle>
          <Link to="/maximise-super">
            <Button variant="outline" size="sm">
              Super Calculator <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {age && superBalance !== undefined && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold">${superBalance.toLocaleString()}</p>
                {superFund && <p className="text-sm text-muted-foreground">with {superFund}</p>}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progress vs Benchmark (Age {age})</p>
                <div className="flex items-center gap-2">
                  <Progress value={Math.min(superProgress, 100)} className="flex-1" />
                  <span className="text-sm font-medium">{superProgress.toFixed(0)}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Benchmark: ${superBenchmark?.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {superProgress < 100 && superBenchmark && superBalance !== undefined && (
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">Catch-Up Strategy</h4>
              <p className="text-sm text-orange-800">
                To reach the benchmark by age 60, consider contributing an additional{' '}
                <strong>${Math.round((superBenchmark - superBalance) / ((60 - (age || 30)) * 12)).toLocaleString()}</strong> per month.
                This could be achieved through salary sacrifice or personal contributions.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insurance Coverage */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
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

          {insuranceGaps.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-3">Coverage Gaps Identified</h4>
              {insuranceGaps.map((gap, index) => (
                <div key={index} className="mb-2">
                  <p className="font-medium text-red-800">{gap.type}</p>
                  <p className="text-sm text-red-700">
                    Recommended: ${gap.recommended.toLocaleString()} - {gap.reason}
                  </p>
                </div>
              ))}
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

      {/* Debt Analysis */}
      {debtTypes.length > 0 && (
        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-red-600" />
              Debt Strategy
            </CardTitle>
            <Link to="/pay-off-home-loan">
              <Button variant="outline" size="sm">
                Debt Calculator <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Current Debts</p>
              <div className="flex flex-wrap gap-2">
                {debtTypes.map((debt, index) => (
                  <Badge key={index} variant="destructive">{debt}</Badge>
                ))}
              </div>
            </div>

            {debtTypes.includes("Credit Card") && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">High-Interest Debt Priority</h4>
                <p className="text-sm text-yellow-800">
                  Credit card debt typically charges 15-25% interest. Focus on paying this off first 
                  before investing elsewhere. Every dollar saved on interest is a guaranteed return.
                </p>
              </div>
            )}

            {debtTypes.includes("Mortgage") && mortgageRate && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Mortgage Rate Check</h4>
                <p className="text-sm text-blue-800">
                  Your current rate: {mortgageRate}%. Current market rates are around 6.0-6.5%. 
                  {mortgageRate > 6.5 ? " Consider refinancing to save thousands annually." : 
                   " Your rate is competitive with current market conditions."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Investment Strategy */}
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-600" />
            Investment Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {debtTypes.some(debt => ["Credit Card", "Personal Loan"].includes(debt)) ? (
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">Focus on Debt First</h4>
              <p className="text-sm text-red-800">
                Before investing, prioritize paying off high-interest debt. The guaranteed 
                15-25% "return" from paying off credit cards beats most investment returns.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Ready to Invest</h4>
                <p className="text-sm text-green-800">
                  With high-interest debt under control, you're ready to grow your wealth through investments.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Conservative (Low Risk)</h5>
                  <p className="text-sm text-muted-foreground">
                    High-yield savings, term deposits, government bonds
                  </p>
                  <p className="text-sm font-medium text-green-600">Expected: 3-5% annually</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Balanced (Medium Risk)</h5>
                  <p className="text-sm text-muted-foreground">
                    Index funds (VAS, VGS), balanced managed funds
                  </p>
                  <p className="text-sm font-medium text-blue-600">Expected: 6-8% annually</p>
                </div>
              </div>

              {assets.some(asset => asset.type.toLowerCase().includes('share')) && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Debt Recycling Strategy</h4>
                  <p className="text-sm text-purple-800">
                    With existing shares, consider debt recycling: Use home equity to invest in 
                    income-producing assets. Interest becomes tax-deductible while building wealth.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Plan */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <CardHeader>
          <CardTitle>Your Financial Action Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <p className="font-medium">Create a comprehensive budget</p>
              <Link to="/#budget">
                <Button variant="outline" size="sm">
                  Start Budget <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            {debtTypes.some(debt => ["Credit Card", "Personal Loan"].includes(debt)) && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <p className="font-medium">Eliminate high-interest debt immediately</p>
              </div>
            )}
            
            {insuranceGaps.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <p className="font-medium">Address insurance coverage gaps</p>
              </div>
            )}
            
            {superProgress < 100 && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <p className="font-medium">Boost superannuation contributions</p>
              </div>
            )}
          </div>

          <div className="bg-emerald-50 p-4 rounded-lg">
            <h4 className="font-semibold text-emerald-900 mb-2">Financial Health Score</h4>
            <div className="flex items-center gap-4">
              <Progress value={75} className="flex-1" />
              <span className="text-lg font-bold text-emerald-600">75/100</span>
            </div>
            <p className="text-sm text-emerald-800 mt-2">
              You're on track! Focus on the action items above to optimize your financial position.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FullFinancialHealthCheck;