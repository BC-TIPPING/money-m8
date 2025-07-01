
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp, Home } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const InvestmentPropertyCalculator: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [duration, setDuration] = useState(30);
  const [isInterestOnly, setIsInterestOnly] = useState(false);
  const [rent, setRent] = useState(600);
  const [rates, setRates] = useState(175);
  const [insurance, setInsurance] = useState(220);
  const [utilities, setUtilities] = useState(150);
  const [frequency, setFrequency] = useState('Monthly');
  const [propertyAppreciation, setPropertyAppreciation] = useState(4);

  // Convert all amounts to monthly
  const getMonthlyAmount = (amount: number) => {
    switch (frequency) {
      case 'Weekly': return amount * 4.33;
      case 'Fortnightly': return amount * 2.165;
      case 'Yearly': return amount / 12;
      default: return amount;
    }
  };

  const monthlyRent = getMonthlyAmount(rent);
  const monthlyRates = getMonthlyAmount(rates);
  const monthlyInsurance = getMonthlyAmount(insurance);
  const monthlyUtilities = getMonthlyAmount(utilities);

  // Calculate monthly repayment
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = duration * 12;
  
  let monthlyRepayment = 0;
  if (isInterestOnly) {
    monthlyRepayment = loanAmount * monthlyRate;
  } else {
    monthlyRepayment = loanAmount > 0 
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
        (Math.pow(1 + monthlyRate, numPayments) - 1)
      : 0;
  }

  // Calculate monthly cash flow
  const monthlyExpenses = monthlyRepayment + monthlyRates + monthlyInsurance + monthlyUtilities;
  const monthlyCashFlow = monthlyRent - monthlyExpenses;

  const generateChartData = () => {
    const data = [];
    let cumulativeOutOfPocket = 0;
    let propertyValue = loanAmount * 1.2; // Assume property worth 20% more than loan
    let remainingLoan = loanAmount;

    for (let year = 0; year <= Math.min(duration, 30); year++) {
      // Calculate annual property appreciation using user input
      const appreciatedValue = propertyValue * Math.pow(1 + (propertyAppreciation / 100), year);
      
      // Calculate remaining loan balance
      if (!isInterestOnly && year > 0) {
        const paymentsMade = year * 12;
        const remainingPayments = numPayments - paymentsMade;
        if (remainingPayments > 0) {
          remainingLoan = monthlyRepayment * (Math.pow(1 + monthlyRate, remainingPayments) - 1) / 
                         (monthlyRate * Math.pow(1 + monthlyRate, remainingPayments));
        } else {
          remainingLoan = 0;
        }
      }

      // Calculate net equity
      const netEquity = appreciatedValue - remainingLoan;
      
      // Calculate cumulative out of pocket (negative cash flow only)
      if (monthlyCashFlow < 0) {
        cumulativeOutOfPocket += Math.abs(monthlyCashFlow) * 12;
      }

      data.push({
        year,
        propertyValue: Math.round(appreciatedValue),
        loanBalance: Math.round(remainingLoan),
        netEquity: Math.round(netEquity),
        cumulativeOutOfPocket: Math.round(cumulativeOutOfPocket),
        netEquityMinusOutOfPocket: Math.round(netEquity - cumulativeOutOfPocket)
      });
    }
    return data;
  };

  const chartData = generateChartData();

  const chartConfig = {
    netEquity: {
      label: "Net Equity",
      color: "hsl(var(--chart-1))"
    },
    cumulativeOutOfPocket: {
      label: "Cumulative Out of Pocket",
      color: "hsl(var(--chart-2))"
    },
    netEquityMinusOutOfPocket: {
      label: "Net Equity - Out of Pocket",
      color: "hsl(var(--chart-3))"
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Investment Property Calculator 🏠💰
        </CardTitle>
        <CardDescription>
          Calculate the financial impact of buying an investment property including cash flow, equity growth, and out-of-pocket costs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="loanAmount">Loan Amount</Label>
            <Input
              id="loanAmount"
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              placeholder="500000"
            />
          </div>
          <div>
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Input
              id="interestRate"
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              placeholder="6.5"
            />
          </div>
          <div>
            <Label htmlFor="duration">Loan Duration (years)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              placeholder="30"
            />
          </div>
          <div>
            <Label htmlFor="propertyAppreciation">Property Value Increase (% yearly)</Label>
            <Input
              id="propertyAppreciation"
              type="number"
              step="0.1"
              value={propertyAppreciation}
              onChange={(e) => setPropertyAppreciation(Number(e.target.value))}
              placeholder="4"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="interestOnly"
              checked={isInterestOnly}
              onCheckedChange={setIsInterestOnly}
            />
            <Label htmlFor="interestOnly">Interest Only</Label>
          </div>
          <div>
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Fortnightly">Fortnightly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="rent">Rent ({frequency})</Label>
            <Input
              id="rent"
              type="number"
              value={rent}
              onChange={(e) => setRent(Number(e.target.value))}
              placeholder="600"
            />
          </div>
          <div>
            <Label htmlFor="rates">Rates ({frequency})</Label>
            <Input
              id="rates"
              type="number"
              value={rates}
              onChange={(e) => setRates(Number(e.target.value))}
              placeholder="175"
            />
          </div>
          <div>
            <Label htmlFor="insurance">Insurance ({frequency})</Label>
            <Input
              id="insurance"
              type="number"
              value={insurance}
              onChange={(e) => setInsurance(Number(e.target.value))}
              placeholder="220"
            />
          </div>
          <div>
            <Label htmlFor="utilities">Utilities ({frequency})</Label>
            <Input
              id="utilities"
              type="number"
              value={utilities}
              onChange={(e) => setUtilities(Number(e.target.value))}
              placeholder="150"
            />
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-blue-50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-lg text-blue-900">Monthly Cash Flow Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Monthly Rental Income:</p>
              <p className="text-lg font-semibold text-green-600">
                ${monthlyRent.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Expenses:</p>
              <p className="text-lg font-semibold text-red-600">
                ${monthlyExpenses.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Net Monthly Cash Flow:</p>
              <p className={`text-lg font-semibold ${monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${monthlyCashFlow.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>

        {/* Combined Chart Section */}
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-4">Investment Property Financial Overview</h3>
            <ChartContainer config={chartConfig} className="h-[400px]">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="netEquity" 
                  stroke="var(--color-netEquity)" 
                  fill="var(--color-netEquity)" 
                  fillOpacity={0.3}
                />
                <Line 
                  type="monotone" 
                  dataKey="cumulativeOutOfPocket" 
                  stroke="var(--color-cumulativeOutOfPocket)" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Line 
                  type="monotone" 
                  dataKey="netEquityMinusOutOfPocket" 
                  stroke="var(--color-netEquityMinusOutOfPocket)" 
                  strokeWidth={3}
                />
              </ComposedChart>
            </ChartContainer>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">Key Investment Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
            <div>
              <p><strong>Monthly Repayment:</strong> ${monthlyRepayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
              <p><strong>Loan Type:</strong> {isInterestOnly ? 'Interest Only' : 'Principal & Interest'}</p>
            </div>
            <div>
              <p><strong>Annual Cash Flow:</strong> ${(monthlyCashFlow * 12).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
              <p><strong>Rental Yield:</strong> {((monthlyRent * 12) / (loanAmount * 1.2) * 100).toFixed(2)}%</p>
              <p><strong>Property Appreciation:</strong> {propertyAppreciation}% per year</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentPropertyCalculator;
