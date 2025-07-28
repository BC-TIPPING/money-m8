
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Scissors } from 'lucide-react';

interface DebtPayoffVisualizationProps {
  debtDetails: any[];
  monthlyIncome: number;
}

const DebtPayoffVisualization: React.FC<DebtPayoffVisualizationProps> = ({ debtDetails, monthlyIncome }) => {
  const generatePayoffData = () => {
    const creditCardDebt = debtDetails.find(debt => debt.type === 'Credit Card');
    if (!creditCardDebt) return { data: [], metrics: null };

    const balance = parseFloat(creditCardDebt.balance) || 10000;
    const rate = parseFloat(creditCardDebt.interestRate) || 20;
    const monthlyRate = rate / 100 / 12;
    
    const minimumPayment = Math.max(balance * 0.02, 50); // 2% minimum or $50
    const aggressivePayment = Math.min(monthlyIncome * 0.15, 500); // 15% of income or $500 cap
    const extraPayment = aggressivePayment - minimumPayment;

    // Calculate minimum payment scenario
    let minBalance = balance;
    let minTotalInterest = 0;
    let minMonths = 0;
    
    while (minBalance > 0 && minMonths < 360) { // 30 year cap
      const interest = minBalance * monthlyRate;
      minTotalInterest += interest;
      minBalance = Math.max(0, minBalance + interest - minimumPayment);
      minMonths++;
    }

    // Calculate aggressive payment scenario
    let aggBalance = balance;
    let aggTotalInterest = 0;
    let aggMonths = 0;
    
    while (aggBalance > 0 && aggMonths < 360) {
      const interest = aggBalance * monthlyRate;
      aggTotalInterest += interest;
      aggBalance = Math.max(0, aggBalance + interest - aggressivePayment);
      aggMonths++;
    }

    // Generate chart data
    const data = [];
    let currentMinBalance = balance;
    let currentAggBalance = balance;

    for (let month = 0; month <= Math.min(minMonths, 36); month++) {
      data.push({
        month,
        minimumPayment: Math.max(0, currentMinBalance),
        aggressivePayment: Math.max(0, currentAggBalance)
      });

      if (month > 0) {
        // Minimum payment scenario
        const minInterest = currentMinBalance * monthlyRate;
        currentMinBalance = Math.max(0, currentMinBalance + minInterest - minimumPayment);
        
        // Aggressive payment scenario
        const aggInterest = currentAggBalance * monthlyRate;
        currentAggBalance = Math.max(0, currentAggBalance + aggInterest - aggressivePayment);
      }
    }

    const monthsSaved = minMonths - aggMonths;
    const interestSaved = minTotalInterest - aggTotalInterest;
    const monthlyLeftOver = extraPayment; // After debt is paid off, this becomes available

    return {
      data: data,
      metrics: {
        monthsSaved,
        interestSaved,
        monthlyLeftOver,
        extraPayment,
        timeToPayoff: aggMonths
      }
    };
  };

  const { data: payoffData, metrics } = generatePayoffData();

  if (payoffData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Debt Payoff Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No high-interest debt detected. Great job!</p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold">{`Month: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: $${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="relative">
          <CreditCard className="h-6 w-6 text-red-500" />
          <Scissors className="h-4 w-4 text-red-600 absolute -top-1 -right-1" />
        </div>
        <CardTitle>Credit Card Debt Payoff Strategy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metrics Summary */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                ${metrics.interestSaved.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Interest Saved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {Math.floor(metrics.monthsSaved / 12)} years {metrics.monthsSaved % 12} months
              </p>
              <p className="text-sm text-muted-foreground">Time Saved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                ${metrics.monthlyLeftOver.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Monthly Money Freed Up</p>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            By paying an extra <strong>${metrics?.extraPayment.toLocaleString()}/month</strong> instead of just the minimum, 
            you could be debt-free in <strong>{Math.floor((metrics?.timeToPayoff || 0) / 12)} years</strong> instead of decades.
          </p>
          <p>
            Once paid off, you'll have <strong>${metrics?.monthlyLeftOver.toLocaleString()}</strong> extra each month 
            to invest, save, or spend on what matters to you.
          </p>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={payoffData} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                label={{ value: 'Months', position: 'insideBottom', offset: -10 }}
              />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="minimumPayment" 
                stackId="1" 
                stroke="hsl(var(--destructive))" 
                fill="hsl(var(--destructive))" 
                fillOpacity={0.6}
                name="Minimum Payment Only"
              />
              <Area 
                type="monotone" 
                dataKey="aggressivePayment" 
                stackId="2" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary))" 
                fillOpacity={0.6}
                name="With Extra Payments"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebtPayoffVisualization;
