
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Home, DollarSign, Calculator } from 'lucide-react';

interface InvestmentPropertyComparisonProps {
  monthlyInvestmentAmount: number;
}

const InvestmentPropertyComparison: React.FC<InvestmentPropertyComparisonProps> = ({ 
  monthlyInvestmentAmount 
}) => {
  
  const calculations = useMemo(() => {
    console.log('InvestmentPropertyComparison - monthlyInvestmentAmount:', monthlyInvestmentAmount);
    
    // Investment Property Assumptions
    const propertyValue = 600000;
    const depositPercent = 20;
    const deposit = propertyValue * (depositPercent / 100);
    const loanAmount = propertyValue * (1 - depositPercent / 100);
    const interestRate = 6.5;
    const monthlyInterest = (interestRate / 100) / 12;
    const loanTermMonths = 360; // 30 years
    const monthlyRepayment = (loanAmount * monthlyInterest * Math.pow(1 + monthlyInterest, loanTermMonths)) / 
                            (Math.pow(1 + monthlyInterest, loanTermMonths) - 1);
    
    const weeklyRent = 550;
    const yearlyRent = weeklyRent * 52;
    const yearlyRates = 2500;
    const yearlyInsurance = 1200;
    const yearlyRepairs = 3000;
    const yearlyExpenses = yearlyRates + yearlyInsurance + yearlyRepairs + (monthlyRepayment * 12);
    const monthlyOutOfPocket = (yearlyExpenses - yearlyRent) / 12;
    const expectedYearlyReturn = 7.2; // Property growth
    
    // Tax benefits
    const taxWriteOff = Math.max(0, yearlyExpenses - yearlyRent);
    const taxSaved = taxWriteOff * 0.325; // 32.5% tax rate
    const monthlyTaxBenefit = taxSaved / 12;
    const netMonthlyOutOfPocket = monthlyOutOfPocket - monthlyTaxBenefit;
    
    // Direct Investment Comparison (same monthly amount)
    const stockMarketReturn = 7.5; // Annual return
    const monthlyStockReturn = stockMarketReturn / 100 / 12;
    
    // 20-year projection comparison
    const projectionData = [];
    let propertyCurrentValue = propertyValue;
    let totalRentReceived = 0;
    let totalPropertyExpenses = 0;
    let cumulativeOutOfPocket = 0;
    let stockPortfolioValue = 0;
    let remainingLoanBalance = loanAmount;
    
    for (let year = 0; year <= 20; year++) {
      if (year > 0) {
        // Property calculations
        propertyCurrentValue *= (1 + expectedYearlyReturn / 100);
        totalRentReceived += yearlyRent;
        totalPropertyExpenses += yearlyExpenses;
        cumulativeOutOfPocket += Math.abs(netMonthlyOutOfPocket) * 12;
        
        // Loan paydown calculation (simplified)
        const yearlyPrincipalPayment = monthlyRepayment * 12 * 0.3; // Rough estimate of principal portion
        remainingLoanBalance = Math.max(0, remainingLoanBalance - yearlyPrincipalPayment);
        
        // Stock investment calculation
        // Using the same monthly investment amount for fair comparison
        for (let month = 0; month < 12; month++) {
          stockPortfolioValue = stockPortfolioValue * (1 + monthlyStockReturn) + monthlyInvestmentAmount;
        }
      }
      
      const propertyEquity = propertyCurrentValue - remainingLoanBalance;
      const propertyNetPosition = propertyEquity - deposit; // Net position after initial deposit
      
      projectionData.push({
        year,
        propertyValue: Math.round(propertyCurrentValue),
        propertyNetPosition: Math.round(propertyNetPosition),
        stockPortfolio: Math.round(stockPortfolioValue),
        outOfPocket: Math.round(cumulativeOutOfPocket)
      });
    }
    
    console.log('InvestmentPropertyComparison - projectionData sample:', projectionData.slice(0, 3));
    
    return {
      propertyValue,
      deposit,
      monthlyOutOfPocket,
      netMonthlyOutOfPocket,
      yearlyRent,
      yearlyExpenses,
      taxSaved,
      expectedYearlyReturn,
      projectionData,
      finalPropertyNet: projectionData[20].propertyNetPosition,
      finalStockValue: projectionData[20].stockPortfolio,
      monthlyRepayment
    };
  }, [monthlyInvestmentAmount]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded shadow-lg">
          <p className="font-semibold">{`Year: ${label}`}</p>
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
        <div className="flex items-center gap-2">
          <Home className="h-6 w-6 text-blue-600" />
          <CardTitle>Investment Property vs Direct Investment</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Leverage Explanation */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            The Power of Leverage
          </h4>
          <p className="text-sm text-blue-800">
            Property investment uses leverage - you control a ${calculations.propertyValue.toLocaleString()} asset with just a ${calculations.deposit.toLocaleString()} deposit (20%). 
            This amplifies both gains and risks. Your ${Math.abs(calculations.netMonthlyOutOfPocket).toLocaleString()}/month 
            out-of-pocket controls a much larger asset that can appreciate in value.
          </p>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-green-50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              ${calculations.yearlyRent.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Annual Rental Income</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              ${calculations.yearlyExpenses.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Annual Expenses</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              ${Math.round(calculations.taxSaved).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Annual Tax Savings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              ${Math.abs(calculations.netMonthlyOutOfPocket).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Net Monthly Cost</p>
          </div>
        </div>

        {/* Strategy Explanation */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>🏠 Property Strategy:</strong> Purchase a ${calculations.propertyValue.toLocaleString()} investment property 
            generating ${calculations.yearlyRent.toLocaleString()}/year in rent. After expenses and tax benefits, 
            your net cost is ${Math.abs(calculations.netMonthlyOutOfPocket).toLocaleString()}/month.
          </p>
          <p>
            <strong>📈 Direct Investment Alternative:</strong> Invest ${monthlyInvestmentAmount.toLocaleString()}/month 
            directly into a diversified stock portfolio earning 7.5% annually.
          </p>
          <p>
            <strong>🔍 Key Difference:</strong> Property leverage means your returns are amplified - a 7.2% property growth 
            on ${calculations.propertyValue.toLocaleString()} vs 7.5% growth on your accumulated contributions.
          </p>
        </div>

        {/* Comparison Chart */}
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={calculations.projectionData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="year" 
                label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
              />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Line 
                type="monotone" 
                dataKey="propertyValue" 
                stroke="#22c55e" 
                strokeWidth={3}
                name="Property Value"
              />
              <Line 
                type="monotone" 
                dataKey="propertyNetPosition" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Property Net Position"
              />
              <Line 
                type="monotone" 
                dataKey="stockPortfolio" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Stock Portfolio"
              />
              <Line 
                type="monotone" 
                dataKey="outOfPocket" 
                stroke="#ef4444" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Cumulative Investment"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Final Results Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Home className="h-4 w-4" />
              Property Investment (20 years)
            </h4>
            <div className="space-y-2 text-sm">
              <p><strong>Net Position:</strong> ${calculations.finalPropertyNet.toLocaleString()}</p>
              <p><strong>Total Invested:</strong> ${(Math.abs(calculations.netMonthlyOutOfPocket) * 12 * 20 + calculations.deposit).toLocaleString()}</p>
              <p><strong>Leverage Benefit:</strong> Control large appreciating asset</p>
              <p><strong>Tax Benefits:</strong> Depreciation, negative gearing</p>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Stock Portfolio (20 years)
            </h4>
            <div className="space-y-2 text-sm">
              <p><strong>Portfolio Value:</strong> ${calculations.finalStockValue.toLocaleString()}</p>
              <p><strong>Total Invested:</strong> ${(monthlyInvestmentAmount * 12 * 20).toLocaleString()}</p>
              <p><strong>Liquidity:</strong> Easy to buy/sell</p>
              <p><strong>Diversification:</strong> Spread across many assets</p>
            </div>
          </div>
        </div>

        {/* Important Considerations */}
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Important Considerations
          </h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Property requires larger upfront deposit (${calculations.deposit.toLocaleString()}) and ongoing management</li>
            <li>• Vacancy periods, maintenance costs, and interest rate changes affect returns</li>
            <li>• Stock investments offer better liquidity and diversification</li>
            <li>• Property provides inflation hedge and potential tax benefits</li>
            <li>• Consider your risk tolerance, time commitment, and market conditions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentPropertyComparison;
