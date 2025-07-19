
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingDown, Calculator, Clock, DollarSign } from 'lucide-react';
import { normalizeToMonthly } from "@/lib/financialCalculations";

interface DebtSnowballCalculatorProps {
  debtDetails: any[];
  totalMonthlySurplus: number;
}

const DebtSnowballCalculator: React.FC<DebtSnowballCalculatorProps> = ({
  debtDetails,
  totalMonthlySurplus
}) => {
  const [extraPayment, setExtraPayment] = useState(Math.max(totalMonthlySurplus * 0.5, 100));
  const [strategy, setStrategy] = useState<'snowball' | 'avalanche'>('snowball');

  const processedDebts = useMemo(() => {
    return debtDetails.map(debt => ({
      type: debt.type,
      balance: parseFloat(debt.balance) || 0,
      monthlyPayment: normalizeToMonthly(parseFloat(debt.repayments) || 0, debt.repaymentFrequency || 'Monthly'),
      interestRate: (parseFloat(debt.interestRate) || 0) / 100
    })).filter(debt => debt.balance > 0);
  }, [debtDetails]);

  const calculations = useMemo(() => {
    if (processedDebts.length === 0) return { payoffSchedule: [], totalInterest: 0, totalTime: 0, interestSaved: 0 };

    // Sort debts based on strategy
    const sortedDebts = [...processedDebts].sort((a, b) => {
      if (strategy === 'snowball') {
        return a.balance - b.balance; // Smallest balance first
      } else {
        return b.interestRate - a.interestRate; // Highest interest rate first
      }
    });

    let totalExtraPayment = extraPayment;
    let monthlySchedule = [];
    let currentMonth = 0;
    let remainingDebts = sortedDebts.map(debt => ({ ...debt }));
    let totalInterestPaid = 0;

    while (remainingDebts.length > 0 && currentMonth < 600) { // Max 50 years
      currentMonth++;
      let monthlyInterest = 0;
      let remainingExtra = totalExtraPayment;

      // Apply payments to all debts
      remainingDebts = remainingDebts.map(debt => {
        const monthlyInterestCharge = debt.balance * (debt.interestRate / 12);
        monthlyInterest += monthlyInterestCharge;
        
        let payment = debt.monthlyPayment;
        
        // Apply extra payment to first debt (current target)
        if (remainingDebts.indexOf(debt) === 0 && remainingExtra > 0) {
          const extraForThisDebt = Math.min(remainingExtra, debt.balance - (payment - monthlyInterestCharge));
          payment += extraForThisDebt;
          remainingExtra -= extraForThisDebt;
        }

        const principalPayment = payment - monthlyInterestCharge;
        const newBalance = Math.max(0, debt.balance - principalPayment);

        return {
          ...debt,
          balance: newBalance
        };
      }).filter(debt => debt.balance > 0);

      totalInterestPaid += monthlyInterest;

      monthlySchedule.push({
        month: currentMonth,
        totalBalance: remainingDebts.reduce((sum, debt) => sum + debt.balance, 0),
        monthlyInterest,
        debtsRemaining: remainingDebts.length
      });
    }

    // Calculate minimum payment schedule for comparison
    let minPaymentDebts = [...processedDebts];
    let minPaymentInterest = 0;
    let minPaymentMonth = 0;

    while (minPaymentDebts.length > 0 && minPaymentMonth < 600) {
      minPaymentMonth++;
      let monthlyInterest = 0;

      minPaymentDebts = minPaymentDebts.map(debt => {
        const monthlyInterestCharge = debt.balance * (debt.interestRate / 12);
        monthlyInterest += monthlyInterestCharge;
        const principalPayment = debt.monthlyPayment - monthlyInterestCharge;
        const newBalance = Math.max(0, debt.balance - principalPayment);

        return { ...debt, balance: newBalance };
      }).filter(debt => debt.balance > 0);

      minPaymentInterest += monthlyInterest;
    }

    return {
      payoffSchedule: monthlySchedule,
      totalInterest: totalInterestPaid,
      totalTime: currentMonth,
      interestSaved: minPaymentInterest - totalInterestPaid,
      timeSaved: minPaymentMonth - currentMonth
    };
  }, [processedDebts, extraPayment, strategy]);

  const totalDebtBalance = processedDebts.reduce((sum, debt) => sum + debt.balance, 0);

  if (processedDebts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Debt Reduction Calculator 🚀
          </CardTitle>
          <CardDescription>No debt details found to calculate</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Debt Reduction Calculator 🚀
        </CardTitle>
        <CardDescription>
          See how extra payments can help you become debt-free faster using the debt snowball or avalanche method.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="extraPayment">Extra Monthly Payment</Label>
            <Input
              id="extraPayment"
              type="number"
              value={extraPayment}
              onChange={(e) => setExtraPayment(Number(e.target.value))}
              placeholder="200"
            />
          </div>
          <div>
            <Label htmlFor="strategy">Payoff Strategy</Label>
            <select
              id="strategy"
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as 'snowball' | 'avalanche')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="snowball">Debt Snowball (Smallest Balance First)</option>
              <option value="avalanche">Debt Avalanche (Highest Interest First)</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Interest Saved</p>
                  <p className="text-lg font-bold text-green-600">
                    ${calculations.interestSaved.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Time Saved</p>
                  <p className="text-lg font-bold text-blue-600">
                    {Math.floor(calculations.timeSaved / 12)}y {calculations.timeSaved % 12}m
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Payoff Time</p>
                  <p className="text-lg font-bold text-purple-600">
                    {Math.floor(calculations.totalTime / 12)}y {calculations.totalTime % 12}m
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Debt</p>
                  <p className="text-lg font-bold text-red-600">
                    ${totalDebtBalance.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visualization */}
        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chart">Payoff Chart</TabsTrigger>
            <TabsTrigger value="table">Debt Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={calculations.payoffSchedule}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    label={{ value: 'Months', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    label={{ value: 'Balance ($)', angle: -90, position: 'insideLeft' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Total Balance']}
                    labelFormatter={(month) => `Month ${month}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalBalance" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="table">
            <div className="space-y-4">
              <h3 className="font-semibold">Current Debt Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 p-2 text-left">Debt Type</th>
                      <th className="border border-gray-200 p-2 text-right">Balance</th>
                      <th className="border border-gray-200 p-2 text-right">Monthly Payment</th>
                      <th className="border border-gray-200 p-2 text-right">Interest Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedDebts
                      .sort((a, b) => strategy === 'snowball' ? a.balance - b.balance : b.interestRate - a.interestRate)
                      .map((debt, index) => (
                      <tr key={index} className={index === 0 ? 'bg-blue-50' : ''}>
                        <td className="border border-gray-200 p-2">
                          {debt.type} {index === 0 && <span className="text-blue-600 text-sm">(Target)</span>}
                        </td>
                        <td className="border border-gray-200 p-2 text-right">
                          ${debt.balance.toLocaleString()}
                        </td>
                        <td className="border border-gray-200 p-2 text-right">
                          ${debt.monthlyPayment.toLocaleString()}
                        </td>
                        <td className="border border-gray-200 p-2 text-right">
                          {(debt.interestRate * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Strategy Explanation */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            {strategy === 'snowball' ? 'Debt Snowball Method' : 'Debt Avalanche Method'}
          </h3>
          <p className="text-sm text-blue-800">
            {strategy === 'snowball' 
              ? 'Pay minimum on all debts, then put extra money toward the smallest balance first. This builds momentum and motivation as you eliminate debts quickly.'
              : 'Pay minimum on all debts, then put extra money toward the highest interest rate first. This method saves the most money in interest over time.'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebtSnowballCalculator;
