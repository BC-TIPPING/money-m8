
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

interface DebtDetail {
  type: string;
  balance: string;
  repayments: string;
  interestRate: string;
}

interface DebtSnowballCalculatorProps {
  debtDetails: DebtDetail[];
  totalMonthlySurplus: number;
}

const chartConfig = {
  currentPlan: { label: "Current Plan", color: "#9CA3AF" },
  withExtra: { label: "With Extra Payments", color: "#059669" },
} satisfies ChartConfig;

const DebtSnowballCalculator: React.FC<DebtSnowballCalculatorProps> = ({
  debtDetails,
  totalMonthlySurplus
}) => {
  const [extraPayment, setExtraPayment] = useState(Math.max(totalMonthlySurplus * 0.5, 50));

  const calculationResults = useMemo(() => {
    const validDebts = debtDetails.filter(debt => 
      parseFloat(debt.balance) > 0 && 
      parseFloat(debt.repayments) > 0 && 
      parseFloat(debt.interestRate) > 0
    );

    if (validDebts.length === 0) return null;

    // Calculate current plan (minimum payments only)
    const calculatePayoffSchedule = (debts: DebtDetail[], extraMonthlyPayment: number = 0) => {
      const debtsCopy = debts.map(debt => ({
        ...debt,
        currentBalance: parseFloat(debt.balance),
        monthlyPayment: parseFloat(debt.repayments),
        rate: parseFloat(debt.interestRate) / 100 / 12,
      }));

      // Sort by interest rate (highest first) for avalanche method
      debtsCopy.sort((a, b) => parseFloat(b.interestRate) - parseFloat(a.interestRate));

      const schedule: { month: number, totalBalance: number, currentPlan?: number, withExtra?: number }[] = [];
      let month = 0;
      let totalExtraUsed = 0;

      while (debtsCopy.some(debt => debt.currentBalance > 0) && month < 360) {
        let totalBalance = 0;
        let availableExtra = extraMonthlyPayment;

        // Apply interest and minimum payments
        debtsCopy.forEach(debt => {
          if (debt.currentBalance > 0) {
            const interestCharge = debt.currentBalance * debt.rate;
            debt.currentBalance += interestCharge;
            debt.currentBalance -= debt.monthlyPayment;
            debt.currentBalance = Math.max(0, debt.currentBalance);
          }
        });

        // Apply extra payment to highest interest debt first
        if (extraMonthlyPayment > 0) {
          for (const debt of debtsCopy) {
            if (debt.currentBalance > 0 && availableExtra > 0) {
              const extraToApply = Math.min(availableExtra, debt.currentBalance);
              debt.currentBalance -= extraToApply;
              availableExtra -= extraToApply;
              totalExtraUsed += extraToApply;
              
              if (debt.currentBalance <= 0) {
                debt.currentBalance = 0;
              }
            }
          }
        }

        totalBalance = debtsCopy.reduce((sum, debt) => sum + debt.currentBalance, 0);
        schedule.push({ month, totalBalance });
        month++;
      }

      return schedule;
    };

    const currentSchedule = calculatePayoffSchedule(validDebts, 0);
    const extraSchedule = calculatePayoffSchedule(validDebts, extraPayment);

    // Combine schedules for chart
    const maxMonths = Math.max(currentSchedule.length, extraSchedule.length);
    const chartData = [];
    
    for (let i = 0; i < maxMonths; i++) {
      const currentBalance = i < currentSchedule.length ? currentSchedule[i].totalBalance : 0;
      const extraBalance = i < extraSchedule.length ? extraSchedule[i].totalBalance : 0;
      
      chartData.push({
        month: i,
        currentPlan: currentBalance,
        withExtra: extraBalance,
      });
    }

    const currentPayoffMonths = currentSchedule.length;
    const extraPayoffMonths = extraSchedule.length;
    const monthsSaved = currentPayoffMonths - extraPayoffMonths;
    const yearsSaved = Math.floor(monthsSaved / 12);
    const remainingMonths = monthsSaved % 12;

    // Calculate total interest saved (simplified)
    const totalCurrentDebt = validDebts.reduce((sum, debt) => sum + parseFloat(debt.balance), 0);
    const totalInterestSaved = (totalCurrentDebt * 0.15 * monthsSaved) / 12; // Rough estimate

    return {
      chartData,
      monthsSaved,
      yearsSaved,
      remainingMonths,
      interestSaved: totalInterestSaved,
      currentPayoffMonths,
      extraPayoffMonths,
    };
  }, [debtDetails, extraPayment]);

  if (!calculationResults) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Debt Reduction Calculator 💳</CardTitle>
          <CardDescription>No valid debt details found to calculate reduction strategy.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Debt Reduction Calculator 💳</CardTitle>
        <CardDescription>See how extra payments can eliminate your debts faster</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="extraPayment">Extra Monthly Payment ($)</Label>
          <Input
            id="extraPayment"
            type="number"
            value={extraPayment}
            onChange={(e) => setExtraPayment(parseFloat(e.target.value) || 0)}
            className="w-full"
          />
        </div>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Time Saved</p>
                <p className="text-xl font-bold text-green-700">
                  {calculationResults.yearsSaved > 0 && `${calculationResults.yearsSaved}y `}
                  {calculationResults.remainingMonths}m
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Interest Saved</p>
                <p className="text-xl font-bold text-green-700">
                  ${calculationResults.interestSaved.toLocaleString('en-AU', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Debt Free In</p>
                <p className="text-xl font-bold text-green-700">
                  {Math.floor(calculationResults.extraPayoffMonths / 12)}y {calculationResults.extraPayoffMonths % 12}m 🎉
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Debt Payoff Comparison</p>
              <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={calculationResults.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={(value) => `${Math.floor(value/12)}y`}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${(value / 1000)}k`}
                    />
                    <Tooltip
                      content={<ChartTooltipContent
                        formatter={(value) => `$${value.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`}
                        labelFormatter={(label) => `Month ${label}`}
                      />}
                    />
                    <Line 
                      dataKey="currentPlan" 
                      stroke="var(--color-currentPlan)" 
                      strokeWidth={2} 
                      dot={false} 
                    />
                    <Line 
                      dataKey="withExtra" 
                      stroke="var(--color-withExtra)" 
                      strokeWidth={2} 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default DebtSnowballCalculator;
