
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, DollarSign, Target, Calendar } from 'lucide-react';

interface InvestmentGrowthCalculatorProps {
  defaultInvestmentAmount: number;
  currentAge?: number;
}

const InvestmentGrowthCalculator: React.FC<InvestmentGrowthCalculatorProps> = ({
  defaultInvestmentAmount,
  currentAge = 30
}) => {
  const [monthlyInvestment, setMonthlyInvestment] = useState(Math.max(defaultInvestmentAmount, 100));
  const [annualReturn, setAnnualReturn] = useState(7.5);
  const [investmentPeriod, setInvestmentPeriod] = useState(30);
  const [initialInvestment, setInitialInvestment] = useState(1000);

  const calculations = useMemo(() => {
    const monthlyRate = annualReturn / 100 / 12;
    const totalMonths = investmentPeriod * 12;
    
    let balance = initialInvestment;
    const projectionData = [];
    let totalContributions = initialInvestment;
    
    // Calculate month by month growth
    for (let month = 0; month <= totalMonths; month++) {
      const year = Math.floor(month / 12);
      
      if (month > 0) {
        // Add monthly investment
        balance += monthlyInvestment;
        totalContributions += monthlyInvestment;
        
        // Apply monthly growth
        balance *= (1 + monthlyRate);
      }
      
      // Record data points (quarterly for cleaner chart)
      if (month % 3 === 0 || month === 0) {
        projectionData.push({
          year: year,
          quarter: Math.floor((month % 12) / 3) + 1,
          month: month,
          balance: Math.round(balance),
          contributions: Math.round(totalContributions),
          growth: Math.round(balance - totalContributions),
          label: month === 0 ? 'Start' : `Year ${year}${month % 12 !== 0 ? `.${Math.floor((month % 12) / 3) + 1}` : ''}`
        });
      }
    }

    const finalBalance = balance;
    const totalGrowth = finalBalance - totalContributions;
    const averageAnnualGrowth = totalGrowth / investmentPeriod;

    return {
      projectionData,
      finalBalance: Math.round(finalBalance),
      totalContributions: Math.round(totalContributions),
      totalGrowth: Math.round(totalGrowth),
      averageAnnualGrowth: Math.round(averageAnnualGrowth),
      retirementAge: currentAge + investmentPeriod
    };
  }, [monthlyInvestment, annualReturn, investmentPeriod, initialInvestment, currentAge]);

  // Calculate milestone data for different investment amounts
  const milestoneData = useMemo(() => {
    const amounts = [
      Math.round(monthlyInvestment * 0.5),
      monthlyInvestment,
      Math.round(monthlyInvestment * 1.5),
      Math.round(monthlyInvestment * 2)
    ];

    return amounts.map(amount => {
      const monthlyRate = annualReturn / 100 / 12;
      const totalMonths = investmentPeriod * 12;
      let balance = initialInvestment;
      let totalContribs = initialInvestment;

      for (let month = 1; month <= totalMonths; month++) {
        balance += amount;
        totalContribs += amount;
        balance *= (1 + monthlyRate);
      }

      return {
        monthlyAmount: amount,
        finalBalance: Math.round(balance),
        totalContributions: Math.round(totalContribs),
        totalGrowth: Math.round(balance - totalContribs)
      };
    });
  }, [monthlyInvestment, annualReturn, investmentPeriod, initialInvestment]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Investment Growth Calculator 📈
        </CardTitle>
        <CardDescription>
          See how your investments could grow over time with compound returns.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="initialInvestment">Initial Investment</Label>
            <Input
              id="initialInvestment"
              type="number"
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(Number(e.target.value))}
              placeholder="1000"
            />
          </div>
          <div>
            <Label htmlFor="monthlyInvestment">Monthly Investment</Label>
            <Input
              id="monthlyInvestment"
              type="number"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              placeholder="500"
            />
          </div>
          <div>
            <Label htmlFor="annualReturn">Expected Annual Return (%)</Label>
            <Input
              id="annualReturn"
              type="number"
              step="0.1"
              value={annualReturn}
              onChange={(e) => setAnnualReturn(Number(e.target.value))}
              placeholder="7.5"
            />
          </div>
          <div>
            <Label htmlFor="investmentPeriod">Investment Period (years)</Label>
            <Input
              id="investmentPeriod"
              type="number"
              value={investmentPeriod}
              onChange={(e) => setInvestmentPeriod(Number(e.target.value))}
              placeholder="30"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Final Balance</p>
                  <p className="text-lg font-bold text-green-600">
                    ${calculations.finalBalance.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Growth</p>
                  <p className="text-lg font-bold text-blue-600">
                    ${calculations.totalGrowth.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Your Contributions</p>
                  <p className="text-lg font-bold text-purple-600">
                    ${calculations.totalContributions.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">At Age</p>
                  <p className="text-lg font-bold text-orange-600">
                    {calculations.retirementAge}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visualization */}
        <Tabs defaultValue="growth" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="growth">Growth Chart</TabsTrigger>
            <TabsTrigger value="comparison">Investment Comparison</TabsTrigger>
          </TabsList>
          
          <TabsContent value="growth" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={calculations.projectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                    tickFormatter={(month) => Math.floor(month / 12).toString()}
                    interval={Math.max(1, Math.floor(calculations.projectionData.length / 10))}
                  />
                  <YAxis 
                    label={{ value: 'Value ($)', angle: -90, position: 'insideLeft' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      const label = name === 'balance' ? 'Total Balance' : 
                                   name === 'contributions' ? 'Your Contributions' : 'Investment Growth';
                      return [`$${value.toLocaleString()}`, label];
                    }}
                    labelFormatter={(month) => `Year ${Math.floor(month / 12)}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="contributions" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="contributions"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#82ca9d" 
                    strokeWidth={3}
                    name="balance"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="growth" 
                    stroke="#ffc658" 
                    strokeWidth={2}
                    name="growth"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="comparison">
            <div className="space-y-4">
              <h3 className="font-semibold">Investment Amount Comparison</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={milestoneData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="monthlyAmount" 
                      label={{ value: 'Monthly Investment ($)', position: 'insideBottom', offset: -5 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <YAxis 
                      label={{ value: 'Final Balance ($)', angle: -90, position: 'insideLeft' }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Final Balance']}
                      labelFormatter={(monthlyAmount) => `$${monthlyAmount}/month`}
                    />
                    <Bar 
                      dataKey="finalBalance" 
                      fill="#8884d8"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 p-2 text-left">Monthly Investment</th>
                      <th className="border border-gray-200 p-2 text-right">Your Contributions</th>
                      <th className="border border-gray-200 p-2 text-right">Investment Growth</th>
                      <th className="border border-gray-200 p-2 text-right">Final Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {milestoneData.map((data, index) => (
                      <tr key={index} className={data.monthlyAmount === monthlyInvestment ? 'bg-blue-50' : ''}>
                        <td className="border border-gray-200 p-2">
                          ${data.monthlyAmount.toLocaleString()}
                          {data.monthlyAmount === monthlyInvestment && <span className="text-blue-600 text-sm"> (Current)</span>}
                        </td>
                        <td className="border border-gray-200 p-2 text-right">
                          ${data.totalContributions.toLocaleString()}
                        </td>
                        <td className="border border-gray-200 p-2 text-right text-green-600">
                          ${data.totalGrowth.toLocaleString()}
                        </td>
                        <td className="border border-gray-200 p-2 text-right font-semibold">
                          ${data.finalBalance.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Investment Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Power of Compound Growth</h3>
            <p className="text-sm text-green-800">
              Your investments earn returns, and those returns earn returns too. Starting early, even with small amounts, 
              can lead to significant wealth over time due to compound growth.
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Diversification Strategy</h3>
            <p className="text-sm text-blue-800">
              Consider diversifying across different asset classes like stocks, bonds, and ETFs. 
              The 7.5% return shown here represents a balanced portfolio average over long periods.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentGrowthCalculator;
