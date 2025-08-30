import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, DollarSign, Calendar, ExternalLink } from 'lucide-react';
import InvestmentPropertyComparison from './InvestmentPropertyComparison';

interface PostDebtInvestmentVisualizationProps {
  debtDetails: any[];
  monthlyIncome: number;
}

const PostDebtInvestmentVisualization: React.FC<PostDebtInvestmentVisualizationProps> = ({ 
  debtDetails, 
  monthlyIncome 
}) => {
  
  // Check if user has a mortgage
  const hasMortgage = debtDetails.some(debt => 
    debt.type === 'Mortgage' && parseFloat(debt.balance) > 0
  );
  
  console.log('Mortgage Detection Debug:', {
    debtDetails,
    hasMortgage,
    debtTypes: debtDetails.map(debt => debt.type),
    mortgageDebts: debtDetails.filter(debt => debt.type === 'Mortgage')
  });
  
  // Filter high-interest debts (exclude mortgage)
  const highInterestDebts = debtDetails.filter(debt => 
    debt.type !== 'Mortgage' && 
    parseFloat(debt.balance) > 0 && 
    parseFloat(debt.interestRate) > 0
  );

  console.log('PostDebtInvestmentVisualization Debug:', {
    debtDetails,
    highInterestDebts,
    highInterestDebtsLength: highInterestDebts.length
  });

  const generateInvestmentProjection = () => {
    if (highInterestDebts.length === 0) return { data: [], metrics: null };

    // Calculate debt payoff timeline first
    const sortedDebts = [...highInterestDebts].sort((a, b) => 
      parseFloat(b.interestRate) - parseFloat(a.interestRate)
    );

    const totalMinPayments = sortedDebts.reduce((sum, debt) => sum + parseFloat(debt.repayments), 0);
    const extraPayment = Math.min(monthlyIncome * 0.15, 500); // 15% of income or $500 cap
    const totalAvailablePayment = totalMinPayments + extraPayment;

    // Calculate when debt is paid off using debt avalanche method
    let debtsToPayOff = sortedDebts.map(debt => ({
      ...debt,
      balance: parseFloat(debt.balance),
      minPayment: parseFloat(debt.repayments),
      rate: parseFloat(debt.interestRate) / 100 / 12
    }));

    let debtPayoffMonth = 0;
    while (debtsToPayOff.some(d => d.balance > 0) && debtPayoffMonth < 120) {
      let remainingPayment = totalAvailablePayment;
      
      // Pay minimums first
      debtsToPayOff.forEach(debt => {
        if (debt.balance > 0) {
          const interest = debt.balance * debt.rate;
          debt.balance += interest;
          
          const payment = Math.min(debt.minPayment, debt.balance, remainingPayment);
          debt.balance -= payment;
          remainingPayment -= payment;
          
          if (debt.balance < 0.01) debt.balance = 0;
        }
      });

      // Apply extra payment to highest interest debt
      for (let debt of debtsToPayOff) {
        if (debt.balance > 0 && remainingPayment > 0) {
          const extraPayment = Math.min(remainingPayment, debt.balance);
          debt.balance -= extraPayment;
          remainingPayment -= extraPayment;
          
          if (debt.balance < 0.01) debt.balance = 0;
          break;
        }
      }

      debtPayoffMonth++;
    }

    // Calculate investment projection after debt is paid off
    const monthlyInvestmentAmount = totalAvailablePayment * 0.8; // 80% of freed-up money
    const annualReturn = 0.075; // 7.5% average market return
    const monthlyReturn = annualReturn / 12;
    
    // Portfolio allocation for average return calculation
    const conservativeReturn = 0.05; // 5% (bonds, cash)
    const moderateReturn = 0.075; // 7.5% (balanced portfolio)
    const aggressiveReturn = 0.10; // 10% (growth stocks)

    const data = [];
    let conservativeBalance = 0;
    let moderateBalance = 0;
    let aggressiveBalance = 0;
    
    // Start from debt payoff month
    for (let month = 0; month <= 120; month++) {
      if (month < debtPayoffMonth) {
        // During debt payoff period - no investment
        data.push({
          month,
          conservative: 0,
          moderate: 0,
          aggressive: 0,
          debtPayoffPeriod: true
        });
      } else {
        // After debt payoff - start investing
        const investmentMonth = month - debtPayoffMonth;
        
        if (investmentMonth > 0) {
          // Compound previous balance and add new investment
          conservativeBalance = conservativeBalance * (1 + 0.05/12) + monthlyInvestmentAmount;
          moderateBalance = moderateBalance * (1 + 0.075/12) + monthlyInvestmentAmount;
          aggressiveBalance = aggressiveBalance * (1 + 0.10/12) + monthlyInvestmentAmount;
        }
        
        data.push({
          month,
          conservative: Math.max(0, conservativeBalance),
          moderate: Math.max(0, moderateBalance),
          aggressive: Math.max(0, aggressiveBalance),
          debtPayoffPeriod: false
        });
      }
    }

    // Calculate investment values at specific time points
    let tenYearInvestmentBalance = 0;
    let twentyYearInvestmentBalance = 0;
    
    // Calculate future values properly using compound interest formula
    const tenYearsOfInvestment = 120; // 10 years in months
    const twentyYearsOfInvestment = 240; // 20 years in months
    const monthlyRate = 0.075 / 12; // 7.5% annual rate
    
    // Future value of monthly investments compounded
    if (tenYearsOfInvestment > 0) {
      tenYearInvestmentBalance = monthlyInvestmentAmount * ((Math.pow(1 + monthlyRate, tenYearsOfInvestment) - 1) / monthlyRate);
    }
    
    if (twentyYearsOfInvestment > 0) {
      twentyYearInvestmentBalance = monthlyInvestmentAmount * ((Math.pow(1 + monthlyRate, twentyYearsOfInvestment) - 1) / monthlyRate);
    }
    
    const totalInvested = (data.length - debtPayoffMonth) * monthlyInvestmentAmount;
    const finalValue = moderateBalance;
    const totalGains = finalValue - totalInvested;

    return {
      data: data.slice(0, Math.min(debtPayoffMonth + 240, 120)), // Show up to 20 years post-debt or 10 years total
      metrics: {
        debtPayoffMonth,
        monthlyInvestmentAmount,
        tenYearValue: tenYearInvestmentBalance,
        twentyYearValue: twentyYearInvestmentBalance,
        totalInvested: Math.max(0, monthlyInvestmentAmount * twentyYearsOfInvestment),
        totalGains: Math.max(0, twentyYearInvestmentBalance - (monthlyInvestmentAmount * twentyYearsOfInvestment)),
        finalValue: Math.max(0, twentyYearInvestmentBalance),
        yearsTilDebtFree: Math.ceil(debtPayoffMonth / 12)
      }
    };
  };

  const { data: investmentData, metrics } = generateInvestmentProjection();

  // Always show the component in investment section
  if (highInterestDebts.length === 0) {
    // Generate immediate investment projection data
    const monthlyInvestmentAmount = Math.min(monthlyIncome * 0.15, 500);
    const projectionData = [];
    
    let conservativeBalance = 0;
    let moderateBalance = 0;
    let aggressiveBalance = 0;
    
    for (let month = 0; month <= 240; month++) { // 20 years
      if (month > 0) {
        conservativeBalance = conservativeBalance * (1 + 0.05/12) + monthlyInvestmentAmount;
        moderateBalance = moderateBalance * (1 + 0.075/12) + monthlyInvestmentAmount;
        aggressiveBalance = aggressiveBalance * (1 + 0.10/12) + monthlyInvestmentAmount;
      }
      
      projectionData.push({
        month,
        conservative: Math.max(0, conservativeBalance),
        moderate: Math.max(0, moderateBalance),
        aggressive: Math.max(0, aggressiveBalance)
      });
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

    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center gap-2">
          <TrendingUp className="h-6 w-6 text-green-600" />
          <CardTitle>Investment Growth Strategy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-green-800 text-sm">
              🎉 <strong>Excellent!</strong> No high-interest debt detected. You can start investing immediately!
            </p>
          </div>
          
          {/* Investment Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                ${monthlyInvestmentAmount.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Monthly Investment</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                ${(projectionData[120]?.moderate / 1000 || 0).toFixed(0)}k
              </p>
              <p className="text-sm text-muted-foreground">10yr Portfolio Value</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                ${(projectionData[240]?.moderate / 1000 || 0).toFixed(0)}k
              </p>
              <p className="text-sm text-muted-foreground">20yr Portfolio Value</p>
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>💡 Recommended approach:</strong> Start investing <strong>${monthlyInvestmentAmount.toLocaleString()}/month</strong> 
              in a diversified portfolio right away since you have no high-interest debt holding you back.
            </p>
            <p>
              <strong>📈 Growth Potential:</strong> The chart below shows three investment scenarios with different risk levels. 
              A moderate balanced portfolio (7.5% average annual return) could grow to approximately 
              <strong>${(projectionData[240]?.moderate / 1000 || 0).toFixed(0)}k</strong> over 20 years.
            </p>
          </div>

          {/* Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(value) => `${Math.floor(value / 12)}y`}
                  label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '3px' }} />
                
                <Area 
                  type="monotone" 
                  dataKey="conservative" 
                  stackId="1" 
                  stroke="hsl(var(--muted-foreground))" 
                  fill="hsl(var(--muted-foreground))" 
                  fillOpacity={0.3}
                  name="Conservative (5%)"
                />
                <Area 
                  type="monotone" 
                  dataKey="moderate" 
                  stackId="2" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.6}
                  name="Moderate (7.5%)"
                />
                <Area 
                  type="monotone" 
                  dataKey="aggressive" 
                  stackId="3" 
                  stroke="hsl(var(--chart-2))" 
                  fill="hsl(var(--chart-2))" 
                  fillOpacity={0.4}
                  name="Aggressive (10%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Investment Timeline
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Start immediately: ${monthlyInvestmentAmount.toLocaleString()}/month</li>
                <li>• 10 years: ~${(projectionData[120]?.moderate / 1000 || 0).toFixed(0)}k portfolio</li>
                <li>• 20 years: ~${(projectionData[240]?.moderate / 1000 || 0).toFixed(0)}k portfolio</li>
              </ul>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Smart Investment Tips
              </h4>
              <p className="text-sm text-orange-800">
                Start with low-cost index funds or ETFs. Automate your investments to build the habit. 
                Consider increasing contributions as your income grows.
              </p>
            </div>
          </div>
          
          {/* Investment Property Comparison - only show if user has mortgage */}
          {hasMortgage && (
            <div className="mt-8">
              <InvestmentPropertyComparison monthlyInvestmentAmount={monthlyInvestmentAmount} />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const isDebtPeriod = payload[0]?.payload?.debtPayoffPeriod;
      return (
        <div className="bg-background p-3 border rounded shadow-lg">
          <p className="font-semibold">{`Month: ${label}`}</p>
          {isDebtPeriod ? (
            <p className="text-red-600 text-sm">Debt Payoff Period</p>
          ) : (
            payload.map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.color }}>
                {`${entry.name}: $${entry.value.toLocaleString()}`}
              </p>
            ))
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-green-600" />
          <CardTitle>Post-Debt Investment Growth Strategy</CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() => window.open('https://www.vanguard.com.au/', '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Vanguard
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Investment Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-green-50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              ${metrics.monthlyInvestmentAmount.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Monthly Investment</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {metrics.yearsTilDebtFree} years
            </p>
            <p className="text-sm text-muted-foreground">Until Debt-Free</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              ${(metrics.tenYearValue / 1000).toFixed(0)}k
            </p>
            <p className="text-sm text-muted-foreground">10yr Portfolio Value</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              ${(metrics.twentyYearValue / 1000).toFixed(0)}k
            </p>
            <p className="text-sm text-muted-foreground">20yr Portfolio Value</p>
          </div>
        </div>

        {/* Strategy Description */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>🎯 The Plan:</strong> Once your high-interest debt is eliminated in{' '}
            <strong>{metrics.yearsTilDebtFree} years</strong>, redirect 80% of those payments 
            (<strong>${metrics.monthlyInvestmentAmount.toLocaleString()}/month</strong>) into a diversified investment portfolio.
          </p>
          <p>
            <strong>📈 Growth Potential:</strong> Using a balanced portfolio approach (7.5% average annual return), 
            this strategy could build substantial wealth over time. The chart shows three scenarios: 
            conservative (5%), moderate (7.5%), and aggressive (10%) returns.
          </p>
          <p>
            <strong>⚠️ Important:</strong> This projection starts AFTER debt elimination. Do not invest in the market 
            while carrying high-interest debt - paying off debt guarantees the return rate of your interest rate.
          </p>
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={investmentData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                label={{ value: 'Months', position: 'insideBottom', offset: -5 }}
              />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '3px' }} />
              
              {/* Debt payoff period indicator */}
              <Area 
                type="monotone" 
                dataKey="conservative" 
                stackId="1" 
                stroke="hsl(var(--muted-foreground))" 
                fill="hsl(var(--muted-foreground))" 
                fillOpacity={0.3}
                name="Conservative (5%)"
              />
              <Area 
                type="monotone" 
                dataKey="moderate" 
                stackId="2" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary))" 
                fillOpacity={0.6}
                name="Moderate (7.5%)"
              />
              <Area 
                type="monotone" 
                dataKey="aggressive" 
                stackId="3" 
                stroke="hsl(var(--chart-2))" 
                fill="hsl(var(--chart-2))" 
                fillOpacity={0.4}
                name="Aggressive (10%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Wealth Building Timeline
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Year {metrics.yearsTilDebtFree}: Debt eliminated, investing begins</li>
              <li>• Year {metrics.yearsTilDebtFree + 10}: ~${(metrics.tenYearValue / 1000).toFixed(0)}k portfolio</li>
              <li>• Year {metrics.yearsTilDebtFree + 20}: ~${(metrics.twentyYearValue / 1000).toFixed(0)}k portfolio</li>
            </ul>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Power of Compound Growth
            </h4>
            <p className="text-sm text-orange-800">
              By redirecting debt payments to investments, you harness compound growth. 
              Every dollar invested early has more time to grow, potentially turning 
              today's debt payments into tomorrow's financial freedom.
            </p>
          </div>
        </div>
        
        {/* Investment Property Comparison - show if user has mortgage */}
        {hasMortgage && (
          <div className="mt-8">
            <InvestmentPropertyComparison monthlyInvestmentAmount={metrics.monthlyInvestmentAmount} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostDebtInvestmentVisualization;