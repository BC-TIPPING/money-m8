
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Scissors, Car, Home, DollarSign } from 'lucide-react';

interface DebtPayoffVisualizationProps {
  debtDetails: any[];
  monthlyIncome: number;
}

const DebtPayoffVisualization: React.FC<DebtPayoffVisualizationProps> = ({ debtDetails, monthlyIncome }) => {
  
  // Filter high-interest debts (exclude mortgage for now)
  const highInterestDebts = debtDetails.filter(debt => 
    debt.type !== 'Mortgage' && 
    parseFloat(debt.balance) > 0 && 
    parseFloat(debt.interestRate) > 0
  );

  // Find mortgage separately
  const mortgage = debtDetails.find(debt => debt.type === 'Mortgage');

  const generateSnowballData = () => {
    if (highInterestDebts.length === 0) return { data: [], metrics: null };

    // Sort by interest rate (highest first) - avalanche method is mathematically better
    const sortedDebts = [...highInterestDebts].sort((a, b) => 
      parseFloat(b.interestRate) - parseFloat(a.interestRate)
    );

    const totalBalance = sortedDebts.reduce((sum, debt) => sum + parseFloat(debt.balance), 0);
    const totalMinPayments = sortedDebts.reduce((sum, debt) => sum + parseFloat(debt.repayments), 0);
    
    const extraPayment = Math.min(monthlyIncome * 0.15, 500); // 15% of income or $500 cap
    const totalAvailablePayment = totalMinPayments + extraPayment;

    // Calculate minimum payment scenario
    let minScenarioDebts = sortedDebts.map(debt => ({
      ...debt,
      balance: parseFloat(debt.balance),
      minPayment: parseFloat(debt.repayments),
      rate: parseFloat(debt.interestRate) / 100 / 12
    }));

    // Calculate snowball scenario
    let snowballDebts = JSON.parse(JSON.stringify(minScenarioDebts));

    const data = [];
    let month = 0;
    let minTotalInterest = 0;
    let snowballTotalInterest = 0;

    while ((minScenarioDebts.some(d => d.balance > 0) || snowballDebts.some(d => d.balance > 0)) && month < 120) {
      // Calculate balances for chart
      const minTotal = minScenarioDebts.reduce((sum, debt) => sum + Math.max(0, debt.balance), 0);
      const snowballTotal = snowballDebts.reduce((sum, debt) => sum + Math.max(0, debt.balance), 0);
      
      data.push({
        month,
        minimumPayment: Math.max(0, minTotal),
        snowballPayment: Math.max(0, snowballTotal)
      });

      if (month > 0) {
        // Process minimum payment scenario
        minScenarioDebts.forEach(debt => {
          if (debt.balance > 0) {
            const interest = debt.balance * debt.rate;
            minTotalInterest += interest;
            debt.balance = Math.max(0, debt.balance + interest - debt.minPayment);
          }
        });

        // Process snowball scenario
        let remainingPayment = totalAvailablePayment;
        
        // Pay minimums first
        snowballDebts.forEach(debt => {
          if (debt.balance > 0) {
            const interest = debt.balance * debt.rate;
            snowballTotalInterest += interest;
            debt.balance += interest;
            
            const payment = Math.min(debt.minPayment, debt.balance, remainingPayment);
            debt.balance -= payment;
            remainingPayment -= payment;
            
            if (debt.balance < 0.01) debt.balance = 0;
          }
        });

        // Apply extra payment to highest interest debt
        for (let debt of snowballDebts) {
          if (debt.balance > 0 && remainingPayment > 0) {
            const extraPayment = Math.min(remainingPayment, debt.balance);
            debt.balance -= extraPayment;
            remainingPayment -= extraPayment;
            
            if (debt.balance < 0.01) debt.balance = 0;
            break;
          }
        }
      }

      month++;
    }

    const minPayoffMonths = month;
    const snowballPayoffMonths = snowballDebts.every(d => d.balance === 0) ? 
      month - 1 : Math.min(month, 120);

    const monthsSaved = minPayoffMonths - snowballPayoffMonths;
    const interestSaved = minTotalInterest - snowballTotalInterest;
    const monthlyFreedUp = totalAvailablePayment; // After debt is paid off

    return {
      data: data.slice(0, Math.min(60, Math.max(minPayoffMonths, snowballPayoffMonths) + 6)),
      metrics: {
        monthsSaved: Math.max(0, monthsSaved),
        interestSaved: Math.max(0, interestSaved),
        monthlyFreedUp,
        extraPayment,
        timeToPayoff: snowballPayoffMonths,
        totalDebts: sortedDebts.length,
        highestRateDebt: sortedDebts[0]?.type
      }
    };
  };

  const generateMortgageData = () => {
    if (!mortgage || parseFloat(mortgage.balance) === 0) return { data: [], metrics: null };

    const balance = parseFloat(mortgage.balance);
    const rate = parseFloat(mortgage.interestRate) / 100 / 12;
    const minPayment = parseFloat(mortgage.repayments);
    const extraPayment = Math.min(monthlyIncome * 0.05, 1000); // 5% of income or $1000 cap

    // Calculate regular payment scenario
    let regBalance = balance;
    let regMonths = 0;
    let regTotalInterest = 0;

    while (regBalance > 0 && regMonths < 360) { // 30 year cap
      const interest = regBalance * rate;
      regTotalInterest += interest;
      regBalance = Math.max(0, regBalance + interest - minPayment);
      regMonths++;
    }

    // Calculate with extra payments
    let extraBalance = balance;
    let extraMonths = 0;
    let extraTotalInterest = 0;

    while (extraBalance > 0 && extraMonths < 360) {
      const interest = extraBalance * rate;
      extraTotalInterest += interest;
      extraBalance = Math.max(0, extraBalance + interest - (minPayment + extraPayment));
      extraMonths++;
    }

    const data = [];
    let currentRegBalance = balance;
    let currentExtraBalance = balance;

    for (let month = 0; month <= Math.min(regMonths, 120); month++) {
      data.push({
        month,
        regularPayment: Math.max(0, currentRegBalance),
        extraPayment: Math.max(0, currentExtraBalance)
      });

      if (month > 0) {
        // Regular payment
        const regInterest = currentRegBalance * rate;
        currentRegBalance = Math.max(0, currentRegBalance + regInterest - minPayment);
        
        // Extra payment
        const extraInterest = currentExtraBalance * rate;
        currentExtraBalance = Math.max(0, currentExtraBalance + extraInterest - (minPayment + extraPayment));
      }
    }

    return {
      data: data,
      metrics: {
        monthsSaved: regMonths - extraMonths,
        interestSaved: regTotalInterest - extraTotalInterest,
        extraPayment,
        yearsSaved: Math.floor((regMonths - extraMonths) / 12)
      }
    };
  };

  const { data: debtData, metrics: debtMetrics } = generateSnowballData();
  const { data: mortgageData, metrics: mortgageMetrics } = generateMortgageData();

  if (highInterestDebts.length === 0 && !mortgage) {
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
        <div className="bg-background p-3 border rounded shadow-lg">
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

  const getDebtIcon = (totalDebts: number) => {
    if (totalDebts === 0) return <CreditCard className="h-6 w-6 text-red-500" />;
    return (
      <div className="flex items-center gap-1">
        <CreditCard className="h-5 w-5 text-red-500" />
        <Car className="h-5 w-5 text-blue-500" />
        <DollarSign className="h-5 w-5 text-orange-500" />
        <Scissors className="h-4 w-4 text-red-600 absolute ml-6 -mt-1" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* High Interest Debt Section */}
      {highInterestDebts.length > 0 && debtData.length > 0 && (
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center gap-2">
            {getDebtIcon(debtMetrics?.totalDebts || 0)}
            <CardTitle>High-Interest Debt Elimination (Debt Avalanche Method)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Debt Metrics Summary */}
            {debtMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    ${debtMetrics.interestSaved.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Interest Saved</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.floor(debtMetrics.monthsSaved / 12)}y {debtMetrics.monthsSaved % 12}m
                  </p>
                  <p className="text-sm text-muted-foreground">Time Saved</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    ${debtMetrics.monthlyFreedUp.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Monthly Money Freed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {debtMetrics.totalDebts}
                  </p>
                  <p className="text-sm text-muted-foreground">Debts to Eliminate</p>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Debt Avalanche Strategy:</strong> Pay minimums on all debts, then attack the{' '}
                <strong>{debtMetrics?.highestRateDebt}</strong> (highest interest rate) with an extra{' '}
                <strong>${debtMetrics?.extraPayment.toLocaleString()}/month</strong>.
              </p>
              <p>
                This mathematically optimal approach saves the most money. Once the highest rate debt is gone, 
                roll that payment into the next highest rate debt until all are eliminated.
              </p>
              <p>
                🎯 <strong>Target:</strong> Debt-free in <strong>{Math.floor((debtMetrics?.timeToPayoff || 0) / 12)} years</strong>, 
                then you'll have <strong>${debtMetrics?.monthlyFreedUp.toLocaleString()}</strong> extra monthly for investing!
              </p>
            </div>

            {/* Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={debtData} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
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
                    name="Minimum Payments Only"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="snowballPayment" 
                    stackId="2" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.6}
                    name="With Debt Avalanche"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mortgage Section */}
      {mortgage && mortgageData.length > 0 && (
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center gap-2">
            <Home className="h-6 w-6 text-green-600" />
            <CardTitle>Mortgage Payoff Acceleration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mortgage Metrics Summary */}
            {mortgageMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-green-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    ${mortgageMetrics.interestSaved.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Interest Saved</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {mortgageMetrics.yearsSaved} years
                  </p>
                  <p className="text-sm text-muted-foreground">Time Saved</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    ${mortgageMetrics.extraPayment.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Extra Monthly Payment</p>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Note:</strong> Only focus on extra mortgage payments AFTER eliminating all high-interest debt 
                (credit cards, personal loans, etc.) as they typically have much higher rates.
              </p>
              <p>
                By adding <strong>${mortgageMetrics?.extraPayment.toLocaleString()}/month</strong> to your mortgage payment, 
                you could pay off your home <strong>{mortgageMetrics?.yearsSaved} years earlier</strong> and save over 
                <strong> ${mortgageMetrics?.interestSaved.toLocaleString()}</strong> in interest.
              </p>
            </div>

            {/* Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mortgageData} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
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
                    dataKey="regularPayment" 
                    stackId="1" 
                    stroke="hsl(var(--muted-foreground))" 
                    fill="hsl(var(--muted-foreground))" 
                    fillOpacity={0.6}
                    name="Regular Payments"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="extraPayment" 
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
      )}
    </div>
  );
};

export default DebtPayoffVisualization;
