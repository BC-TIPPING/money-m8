
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DebtPayoffVisualizationProps {
  debtDetails: any[];
  monthlyIncome: number;
}

const DebtPayoffVisualization: React.FC<DebtPayoffVisualizationProps> = ({ debtDetails, monthlyIncome }) => {
  const generatePayoffData = () => {
    const creditCardDebt = debtDetails.find(debt => debt.type === 'Credit Card');
    if (!creditCardDebt) return [];

    const balance = parseFloat(creditCardDebt.balance) || 10000;
    const rate = parseFloat(creditCardDebt.interestRate) || 20;
    const monthlyRate = rate / 100 / 12;
    
    const data = [];
    let currentBalance = balance;
    let minimumPayment = Math.max(balance * 0.02, 50); // 2% minimum or $50
    let aggressivePayment = Math.min(monthlyIncome * 0.15, 500); // 15% of income or $500 cap

    for (let month = 0; month <= 60 && currentBalance > 0; month++) {
      data.push({
        month,
        minimumPayment: Math.max(0, currentBalance),
        aggressivePayment: Math.max(0, currentBalance - (aggressivePayment - minimumPayment) * month * 0.8)
      });

      if (month > 0) {
        // Minimum payment scenario
        const minInterest = currentBalance * monthlyRate;
        currentBalance = Math.max(0, currentBalance + minInterest - minimumPayment);
        
        // Aggressive payment scenario would be calculated separately
      }
    }

    return data.slice(0, 36); // Show 3 years max
  };

  const payoffData = generatePayoffData();

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
      <CardHeader>
        <CardTitle>Credit Card Debt Payoff Strategy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={payoffData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="minimumPayment" 
                stackId="1" 
                stroke="#ff7300" 
                fill="#ff7300" 
                fillOpacity={0.6}
                name="Minimum Payment"
              />
              <Area 
                type="monotone" 
                dataKey="aggressivePayment" 
                stackId="2" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.6}
                name="Aggressive Payment"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebtPayoffVisualization;
