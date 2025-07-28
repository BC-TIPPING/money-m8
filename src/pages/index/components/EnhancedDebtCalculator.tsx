import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Calculator, TrendingDown, DollarSign, Calendar, Target } from "lucide-react";

interface DebtDetail {
  type: string;
  balance: string;
  repayments: string;
  interestRate: string;
}

interface EnhancedDebtCalculatorProps {
  debtDetails: DebtDetail[];
  totalMonthlySurplus: number;
}

const EnhancedDebtCalculator: React.FC<EnhancedDebtCalculatorProps> = ({
  debtDetails,
  totalMonthlySurplus
}) => {
  // Filter out mortgage debt - only include high-interest consumer debt
  const nonMortgageDebts = useMemo(() => {
    return debtDetails.filter(debt => 
      debt.type !== 'Mortgage' && 
      debt.type !== 'Home Loan' &&
      parseFloat(debt.balance) > 0
    );
  }, [debtDetails]);

  // Enhanced input variables
  const [extraPayment, setExtraPayment] = useState(Math.max(totalMonthlySurplus * 0.5, 100));
  const [payoffStrategy, setPayoffStrategy] = useState<'avalanche' | 'snowball'>('avalanche');
  const [oneOffPayment, setOneOffPayment] = useState(0);
  const [budgetAdjustment, setBudgetAdjustment] = useState(0);
  const [useWindfall, setUseWindfall] = useState(false);
  const [windfallAmount, setWindfallAmount] = useState(0);
  const [windfallMonth, setWindfallMonth] = useState(6);
  const [autoIncrease, setAutoIncrease] = useState(false);
  const [increaseAmount, setIncreaseAmount] = useState(25);
  const [increaseFrequency, setIncreaseFrequency] = useState(12);

  const calculationResults = useMemo(() => {
    if (nonMortgageDebts.length === 0) return null;

    const validDebts = nonMortgageDebts.filter(debt => 
      parseFloat(debt.balance) > 0 && 
      parseFloat(debt.repayments) > 0 && 
      parseFloat(debt.interestRate) > 0
    );

    if (validDebts.length === 0) return null;

    const calculatePayoffSchedule = (debts: DebtDetail[], monthlyExtra: number) => {
      const debtsCopy = debts.map(debt => ({
        ...debt,
        currentBalance: parseFloat(debt.balance),
        monthlyPayment: parseFloat(debt.repayments),
        rate: parseFloat(debt.interestRate) / 100 / 12,
        originalBalance: parseFloat(debt.balance),
      }));

      // Sort debts based on strategy
      if (payoffStrategy === 'avalanche') {
        debtsCopy.sort((a, b) => parseFloat(b.interestRate) - parseFloat(a.interestRate));
      } else {
        debtsCopy.sort((a, b) => a.originalBalance - b.originalBalance);
      }

      const schedule: { 
        month: number; 
        totalBalance: number; 
        currentPlan?: number; 
        withExtra?: number;
        monthlyPayment: number;
      }[] = [];
      
      let month = 0;
      let totalInterestPaid = 0;
      let currentExtraPayment = monthlyExtra + budgetAdjustment;

      // Apply one-off payment immediately if set
      if (oneOffPayment > 0 && month === 0) {
        const firstDebt = debtsCopy.find(d => d.currentBalance > 0);
        if (firstDebt) {
          firstDebt.currentBalance = Math.max(0, firstDebt.currentBalance - oneOffPayment);
        }
      }

      while (debtsCopy.some(debt => debt.currentBalance > 0) && month < 360) {
        let totalBalance = 0;
        let availableExtra = currentExtraPayment;
        let monthlyInterest = 0;

        // Apply windfall if applicable
        if (useWindfall && month === windfallMonth) {
          const highestDebt = debtsCopy.find(d => d.currentBalance > 0);
          if (highestDebt) {
            highestDebt.currentBalance = Math.max(0, highestDebt.currentBalance - windfallAmount);
          }
        }

        // Auto-increase extra payment
        if (autoIncrease && month > 0 && month % increaseFrequency === 0) {
          currentExtraPayment += increaseAmount;
          availableExtra = currentExtraPayment;
        }

        // Apply interest and minimum payments
        debtsCopy.forEach(debt => {
          if (debt.currentBalance > 0) {
            const interestCharge = debt.currentBalance * debt.rate;
            monthlyInterest += interestCharge;
            debt.currentBalance += interestCharge;
            
            const minPayment = Math.min(debt.monthlyPayment, debt.currentBalance);
            debt.currentBalance -= minPayment;
            debt.currentBalance = Math.max(0, debt.currentBalance);
          }
        });

        totalInterestPaid += monthlyInterest;

        // Apply extra payment based on strategy
        for (const debt of debtsCopy) {
          if (debt.currentBalance > 0 && availableExtra > 0) {
            const extraToApply = Math.min(availableExtra, debt.currentBalance);
            debt.currentBalance -= extraToApply;
            availableExtra -= extraToApply;
            
            if (debt.currentBalance <= 0) {
              debt.currentBalance = 0;
            }
          }
        }

        totalBalance = debtsCopy.reduce((sum, debt) => sum + debt.currentBalance, 0);
        schedule.push({ 
          month, 
          totalBalance, 
          monthlyPayment: currentExtraPayment + debtsCopy.reduce((sum, d) => sum + (d.currentBalance > 0 ? d.monthlyPayment : 0), 0)
        });
        month++;
      }

      return { schedule, totalInterestPaid };
    };

    // Calculate scenarios
    const currentPlan = calculatePayoffSchedule(validDebts, 0);
    const enhancedPlan = calculatePayoffSchedule(validDebts, extraPayment);

    // Combine schedules for chart
    const maxMonths = Math.max(currentPlan.schedule.length, enhancedPlan.schedule.length);
    const chartData = [];
    
    for (let i = 0; i < maxMonths; i++) {
      const currentBalance = i < currentPlan.schedule.length ? currentPlan.schedule[i].totalBalance : 0;
      const enhancedBalance = i < enhancedPlan.schedule.length ? enhancedPlan.schedule[i].totalBalance : 0;
      
      chartData.push({
        month: i,
        currentPlan: currentBalance,
        enhancedPlan: enhancedBalance,
      });
    }

    const currentPayoffMonths = currentPlan.schedule.length;
    const enhancedPayoffMonths = enhancedPlan.schedule.length;
    const monthsSaved = currentPayoffMonths - enhancedPayoffMonths;
    const yearsSaved = Math.floor(monthsSaved / 12);
    const remainingMonths = monthsSaved % 12;

    const totalCurrentDebt = validDebts.reduce((sum, debt) => sum + parseFloat(debt.balance), 0);
    const interestSaved = currentPlan.totalInterestPaid - enhancedPlan.totalInterestPaid;

    return {
      chartData,
      monthsSaved,
      yearsSaved,
      remainingMonths,
      interestSaved,
      currentPayoffMonths,
      enhancedPayoffMonths,
      totalCurrentDebt,
      currentInterest: currentPlan.totalInterestPaid,
      enhancedInterest: enhancedPlan.totalInterestPaid,
      validDebts,
    };
  }, [nonMortgageDebts, extraPayment, payoffStrategy, oneOffPayment, budgetAdjustment, useWindfall, windfallAmount, windfallMonth, autoIncrease, increaseAmount, increaseFrequency]);

  if (nonMortgageDebts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-emerald-600" />
            Enhanced Debt Reduction Calculator
          </CardTitle>
          <CardDescription>
            🎉 Excellent! You have no high-interest consumer debt to eliminate. 
            Focus on building your investment portfolio instead.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!calculationResults) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-emerald-600" />
            Enhanced Debt Reduction Calculator
          </CardTitle>
          <CardDescription>No valid non-mortgage debt details found to calculate reduction strategy.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-emerald-600" />
          Enhanced Debt Reduction Calculator
        </CardTitle>
        <CardDescription>
          Advanced debt elimination strategy for {calculationResults.validDebts.length} non-mortgage debts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Strategy Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="strategy">Payoff Strategy</Label>
            <Select value={payoffStrategy} onValueChange={(value: 'avalanche' | 'snowball') => setPayoffStrategy(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="avalanche">Debt Avalanche (Highest Interest First)</SelectItem>
                <SelectItem value="snowball">Debt Snowball (Smallest Balance First)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {payoffStrategy === 'avalanche' ? 'Saves the most money' : 'Provides psychological wins'}
            </p>
          </div>
          
          <div>
            <Label htmlFor="extraPayment">Monthly Extra Payment ($)</Label>
            <Input
              id="extraPayment"
              type="number"
              value={extraPayment}
              onChange={(e) => setExtraPayment(parseFloat(e.target.value) || 0)}
              className="w-full"
            />
          </div>
        </div>

        {/* Advanced Options */}
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900">Advanced Options</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="oneOff">One-off Payment ($)</Label>
              <Input
                id="oneOff"
                type="number"
                value={oneOffPayment}
                onChange={(e) => setOneOffPayment(parseFloat(e.target.value) || 0)}
                placeholder="Tax refund, bonus, etc."
              />
            </div>
            
            <div>
              <Label htmlFor="budget">Budget Adjustment ($/month)</Label>
              <Input
                id="budget"
                type="number"
                value={budgetAdjustment}
                onChange={(e) => setBudgetAdjustment(parseFloat(e.target.value) || 0)}
                placeholder="Additional monthly savings"
              />
            </div>
          </div>

          {/* Windfall Settings */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch 
                id="windfall" 
                checked={useWindfall} 
                onCheckedChange={setUseWindfall} 
              />
              <Label htmlFor="windfall">Apply Future Windfall</Label>
            </div>
            
            {useWindfall && (
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div>
                  <Label htmlFor="windfallAmount">Windfall Amount ($)</Label>
                  <Input
                    id="windfallAmount"
                    type="number"
                    value={windfallAmount}
                    onChange={(e) => setWindfallAmount(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="windfallMonth">Apply in Month</Label>
                  <Input
                    id="windfallMonth"
                    type="number"
                    value={windfallMonth}
                    onChange={(e) => setWindfallMonth(parseInt(e.target.value) || 6)}
                    min="1"
                    max="60"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Auto-increase Settings */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch 
                id="autoIncrease" 
                checked={autoIncrease} 
                onCheckedChange={setAutoIncrease} 
              />
              <Label htmlFor="autoIncrease">Auto-increase Payments</Label>
            </div>
            
            {autoIncrease && (
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div>
                  <Label htmlFor="increaseAmount">Increase by ($)</Label>
                  <Input
                    id="increaseAmount"
                    type="number"
                    value={increaseAmount}
                    onChange={(e) => setIncreaseAmount(parseFloat(e.target.value) || 25)}
                  />
                </div>
                <div>
                  <Label htmlFor="increaseFreq">Every (months)</Label>
                  <Select value={increaseFrequency.toString()} onValueChange={(value) => setIncreaseFrequency(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                      <SelectItem value="24">24 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-emerald-700">Time Saved</span>
                </div>
                <p className="text-xl font-bold text-emerald-800">
                  {calculationResults.yearsSaved > 0 && `${calculationResults.yearsSaved}y `}
                  {calculationResults.remainingMonths}m
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-emerald-700">Interest Saved</span>
                </div>
                <p className="text-xl font-bold text-emerald-800">
                  ${calculationResults.interestSaved.toLocaleString()}
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-emerald-700">Debt Free In</span>
                </div>
                <p className="text-xl font-bold text-emerald-800">
                  {Math.floor(calculationResults.enhancedPayoffMonths / 12)}y {calculationResults.enhancedPayoffMonths % 12}m
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calculator className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-emerald-700">Total Debt</span>
                </div>
                <p className="text-xl font-bold text-emerald-800">
                  ${calculationResults.totalCurrentDebt.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="h-80 mt-6">
              <p className="text-sm font-medium text-emerald-700 mb-3">Debt Elimination Progress</p>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={calculationResults.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(value) => `${Math.floor(value/12)}y`}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000)}k`}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      `$${Number(value).toLocaleString()}`,
                      name === 'currentPlan' ? 'Current Plan' : 'Enhanced Plan'
                    ]}
                    labelFormatter={(label) => `Month ${label}`}
                  />
                  <Legend />
                  <Line 
                    dataKey="currentPlan" 
                    stroke="#9CA3AF" 
                    strokeWidth={2} 
                    dot={false}
                    name="Current Plan"
                  />
                  <Line 
                    dataKey="enhancedPlan" 
                    stroke="#059669" 
                    strokeWidth={3} 
                    dot={false}
                    name="Enhanced Plan"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Strategy Explanation */}
            <div className="mt-6 p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-emerald-900 mb-2">
                📋 Your {payoffStrategy === 'avalanche' ? 'Debt Avalanche' : 'Debt Snowball'} Strategy
              </h4>
              <div className="text-sm text-emerald-800 space-y-2">
                <p>
                  <strong>Focus Order:</strong> {payoffStrategy === 'avalanche' 
                    ? 'Pay minimums on all debts, then attack the highest interest rate debt first'
                    : 'Pay minimums on all debts, then attack the smallest balance first'
                  }
                </p>
                <p>
                  <strong>Total Strategy Impact:</strong> Save ${calculationResults.interestSaved.toLocaleString()} 
                  and become debt-free {calculationResults.monthsSaved} months earlier
                </p>
                {(oneOffPayment > 0 || budgetAdjustment > 0 || useWindfall || autoIncrease) && (
                  <p>
                    <strong>Enhanced Features:</strong> 
                    {oneOffPayment > 0 && ` Initial ${oneOffPayment.toLocaleString()} payment`}
                    {budgetAdjustment > 0 && ` • Extra ${budgetAdjustment}/month from budget optimization`}
                    {useWindfall && ` • ${windfallAmount.toLocaleString()} windfall in month ${windfallMonth}`}
                    {autoIncrease && ` • Auto-increase payments by $${increaseAmount} every ${increaseFrequency} months`}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default EnhancedDebtCalculator;