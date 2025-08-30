
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const InvestmentPropertyCalculator = () => {
  const [inputs, setInputs] = useState({
    homeValue: 600000,
    interestRate: 6.5,
    weeklyRent: 550,
    yearlyRates: 2500,
    yearlyInsurance: 1200,
    yearlyRepairs: 3000,
    expectedYearlyReturn: 7.2, // Default 10-year average
    depositPercent: 20
  });

  const calculations = useMemo(() => {
    const loanAmount = inputs.homeValue * (1 - inputs.depositPercent / 100);
    const monthlyInterest = (inputs.interestRate / 100) / 12;
    const monthlyRepayment = (loanAmount * monthlyInterest * Math.pow(1 + monthlyInterest, 360)) / 
                            (Math.pow(1 + monthlyInterest, 360) - 1);
    
    const yearlyRent = inputs.weeklyRent * 52;
    const yearlyExpenses = inputs.yearlyRates + inputs.yearlyInsurance + inputs.yearlyRepairs + (monthlyRepayment * 12);
    const monthlyOutOfPocket = (yearlyExpenses - yearlyRent) / 12;
    
    const taxWriteOff = Math.max(0, yearlyExpenses - yearlyRent);
    const taxSaved = taxWriteOff * 0.325; // Assuming 32.5% tax rate
    
    // 10-year projections
    const projectionData = [];
    let currentValue = inputs.homeValue;
    let totalRentReceived = 0;
    let totalExpensesPaid = 0;
    let cumulativeOutOfPocket = 0;
    
    for (let year = 0; year <= 10; year++) {
      if (year > 0) {
        currentValue *= (1 + inputs.expectedYearlyReturn / 100);
        totalRentReceived += yearlyRent;
        totalExpensesPaid += yearlyExpenses;
        cumulativeOutOfPocket += monthlyOutOfPocket * 12;
      }
      
      const capitalGain = currentValue - inputs.homeValue;
      const netPosition = capitalGain + totalRentReceived - totalExpensesPaid;
      
      projectionData.push({
        year,
        propertyValue: Math.round(currentValue),
        cumulativeRent: Math.round(totalRentReceived),
        cumulativeExpenses: Math.round(totalExpensesPaid),
        netPosition: Math.round(netPosition),
        outOfPocket: Math.round(cumulativeOutOfPocket)
      });
    }
    
    const expectedProfitAfter10Years = projectionData[10].netPosition;
    
    return {
      monthlyOutOfPocket,
      expectedProfitAfter10Years,
      yearlyRent,
      yearlyExpenses,
      taxWriteOff,
      taxSaved,
      projectionData,
      loanAmount,
      monthlyRepayment
    };
  }, [inputs]);

  const handleInputChange = (field: string, value: string) => {
    setInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏘️ Investment Property Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="homeValue">Property Value ($)</Label>
              <Input
                id="homeValue"
                type="number"
                value={inputs.homeValue}
                onChange={(e) => handleInputChange('homeValue', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.1"
                value={inputs.interestRate}
                onChange={(e) => handleInputChange('interestRate', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="weeklyRent">Weekly Rent ($)</Label>
              <Input
                id="weeklyRent"
                type="number"
                value={inputs.weeklyRent}
                onChange={(e) => handleInputChange('weeklyRent', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="yearlyRates">Yearly Rates ($)</Label>
              <Input
                id="yearlyRates"
                type="number"
                value={inputs.yearlyRates}
                onChange={(e) => handleInputChange('yearlyRates', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="yearlyInsurance">Yearly Insurance ($)</Label>
              <Input
                id="yearlyInsurance"
                type="number"
                value={inputs.yearlyInsurance}
                onChange={(e) => handleInputChange('yearlyInsurance', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="yearlyRepairs">Yearly Repairs & Maintenance ($)</Label>
              <Input
                id="yearlyRepairs"
                type="number"
                value={inputs.yearlyRepairs}
                onChange={(e) => handleInputChange('yearlyRepairs', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="expectedYearlyReturn">Expected Yearly Growth (%)</Label>
              <Input
                id="expectedYearlyReturn"
                type="number"
                step="0.1"
                value={inputs.expectedYearlyReturn}
                onChange={(e) => handleInputChange('expectedYearlyReturn', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="depositPercent">Deposit (%)</Label>
              <Input
                id="depositPercent"
                type="number"
                value={inputs.depositPercent}
                onChange={(e) => handleInputChange('depositPercent', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Out-of-pocket per month</div>
              <div className={`text-2xl font-bold ${calculations.monthlyOutOfPocket > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${Math.abs(calculations.monthlyOutOfPocket).toLocaleString('en-AU', { maximumFractionDigits: 0 })}
                {calculations.monthlyOutOfPocket > 0 ? ' cost' : ' profit'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Expected profit after 10 years</div>
              <div className={`text-2xl font-bold ${calculations.expectedProfitAfter10Years > 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${calculations.expectedProfitAfter10Years.toLocaleString('en-AU')}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Total rent per year</div>
              <div className="text-2xl font-bold text-blue-600">
                ${calculations.yearlyRent.toLocaleString('en-AU')}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Total expenses per year</div>
              <div className="text-2xl font-bold text-orange-600">
                ${calculations.yearlyExpenses.toLocaleString('en-AU')}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Tax write-off</div>
              <div className="text-2xl font-bold text-purple-600">
                ${calculations.taxWriteOff.toLocaleString('en-AU')}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Tax saved (32.5%)</div>
              <div className="text-2xl font-bold text-green-600">
                ${calculations.taxSaved.toLocaleString('en-AU')}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">10-Year Investment Projection</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={calculations.projectionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="year" 
                label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                label={{ value: 'Value ($)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `$${value.toLocaleString('en-AU')}`, 
                  name
                ]}
                labelFormatter={(year) => `Year ${year}`}
              />
              <Legend wrapperStyle={{ paddingTop: '3px' }} />
              <Line 
                type="monotone" 
                dataKey="propertyValue" 
                stroke="#22c55e" 
                strokeWidth={3}
                name="Property Value"
              />
              <Line 
                type="monotone" 
                dataKey="netPosition" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Net Position"
              />
              <Line 
                type="monotone" 
                dataKey="outOfPocket" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Cumulative Out-of-Pocket"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentPropertyCalculator;
