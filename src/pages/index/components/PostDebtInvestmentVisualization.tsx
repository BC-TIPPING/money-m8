import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, DollarSign, Calendar } from 'lucide-react';

interface PostDebtInvestmentVisualizationProps {
  debtDetails: any[];
  monthlyIncome: number;
}

const PostDebtInvestmentVisualization: React.FC<PostDebtInvestmentVisualizationProps> = ({ 
  debtDetails, 
  monthlyIncome 
}) => {
  
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
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>💡 Recommended approach:</strong> Start investing <strong>${Math.min(monthlyIncome * 0.15, 500).toLocaleString()}/month</strong> 
              in a diversified portfolio right away since you have no high-interest debt holding you back.
            </p>
            <p>
              <strong>📈 Strategy:</strong> Consider a balanced portfolio with 7.5% average annual returns. 
              Over 20 years, this could grow to approximately <strong>${(Math.min(monthlyIncome * 0.15, 500) * 12 * 20 * 1.5).toLocaleString()}</strong> 
              (including compound growth).
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Investment Timeline
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Start immediately: ${Math.min(monthlyIncome * 0.15, 500).toLocaleString()}/month</li>
                <li>• 10 years: ~${(Math.min(monthlyIncome * 0.15, 500) * 12 * 10 * 1.3 / 1000).toFixed(0)}k portfolio</li>
                <li>• 20 years: ~${(Math.min(monthlyIncome * 0.15, 500) * 12 * 20 * 1.5 / 1000).toFixed(0)}k portfolio</li>
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
      <CardHeader className="flex flex-row items-center gap-2">
        <TrendingUp className="h-6 w-6 text-green-600" />
        <CardTitle>Post-Debt Investment Growth Strategy</CardTitle>
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
            <AreaChart data={investmentData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
              />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
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
      </CardContent>
    </Card>
  );
};

export default PostDebtInvestmentVisualization;