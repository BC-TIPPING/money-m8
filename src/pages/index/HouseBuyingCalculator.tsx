
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, TrendingUp, AlertCircle, Home } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { calculateMonthlyAmount } from "@/lib/financialCalculations";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface HouseBuyingCalculatorProps {
  assessmentData: any;
  totalMonthlyNetIncome: number;
  totalAnnualGrossIncome: number;
}

const HouseBuyingCalculator: React.FC<HouseBuyingCalculatorProps> = ({
  assessmentData,
  totalMonthlyNetIncome,
  totalAnnualGrossIncome,
}) => {
  const [deposit, setDeposit] = useState(100000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);
  
  // Calculate monthly expenses
  const totalMonthlyExpenses = calculateMonthlyAmount(assessmentData.expenseItems);
  
  // Calculate available for housing using 30% rule
  const housingBudget30Percent = totalMonthlyNetIncome * 0.3;
  
  // Calculate maximum borrowing capacity using 6x annual income rule
  const maxBorrowingCapacity = totalAnnualGrossIncome * 6;
  
  // Calculate maximum purchase price
  const maxPurchasePrice = maxBorrowingCapacity + deposit;
  
  // Calculate monthly repayment for max loan
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;
  const monthlyPayment = maxBorrowingCapacity > 0 
    ? (maxBorrowingCapacity * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1)
    : 0;
  
  // Calculate 30% rule maximum loan amount
  const maxLoanFrom30Percent = housingBudget30Percent > 0
    ? (housingBudget30Percent * (Math.pow(1 + monthlyRate, numPayments) - 1)) / 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments))
    : 0;
  
  const maxPurchasePriceFrom30Percent = maxLoanFrom30Percent + deposit;
  
  // Additional housing costs (monthly estimates)
  const additionalCosts = {
    homeInsurance: 200,
    councilRates: 300,
    utilities: 250,
    electricity: 150,
    maintenance: 200
  };
  
  const totalAdditionalCosts = Object.values(additionalCosts).reduce((sum, cost) => sum + cost, 0);
  
  // Generate repayment schedule data for chart
  const generateRepaymentSchedule = () => {
    const schedule = [];
    let balance = maxBorrowingCapacity;
    
    for (let year = 0; year <= Math.min(loanTerm, 30); year += 5) {
      const monthsPassed = year * 12;
      if (monthsPassed <= numPayments) {
        const remainingBalance = balance * Math.pow(1 + monthlyRate, monthsPassed) - 
          monthlyPayment * ((Math.pow(1 + monthlyRate, monthsPassed) - 1) / monthlyRate);
        
        schedule.push({
          year,
          balance: Math.max(0, remainingBalance),
          totalPaid: monthlyPayment * monthsPassed,
          principalPaid: maxBorrowingCapacity - Math.max(0, remainingBalance)
        });
      }
    }
    
    // Add final year
    schedule.push({
      year: loanTerm,
      balance: 0,
      totalPaid: monthlyPayment * numPayments,
      principalPaid: maxBorrowingCapacity
    });
    
    return schedule;
  };
  
  const repaymentData = generateRepaymentSchedule();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          House Buying Calculator 🏠
        </CardTitle>
        <CardDescription>
          Based on your income and expenses, here's what you could potentially borrow for a home.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="deposit">Deposit Amount</Label>
            <Input
              id="deposit"
              type="number"
              value={deposit}
              onChange={(e) => setDeposit(Number(e.target.value))}
              placeholder="100000"
            />
          </div>
          <div>
            <Label htmlFor="interest">Interest Rate (%)</Label>
            <Input
              id="interest"
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              placeholder="6.5"
            />
          </div>
          <div>
            <Label htmlFor="term">Loan Term (years)</Label>
            <Input
              id="term"
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              placeholder="30"
            />
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-blue-50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-lg text-blue-900">Your Borrowing Capacity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Maximum Loan (6x income rule):</p>
              <p className="text-2xl font-bold text-green-600">
                ${maxBorrowingCapacity.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Maximum Purchase Price:</p>
              <p className="text-2xl font-bold text-blue-600">
                ${maxPurchasePrice.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* 30% Rule Section */}
        <div className="bg-orange-50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-lg text-orange-900 flex items-center gap-2">
            <Home className="h-5 w-5" />
            30% Rule Recommendation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Recommended Monthly Housing Budget:</p>
              <p className="text-xl font-bold text-orange-600">
                ${housingBudget30Percent.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Safe Purchase Price (30% rule):</p>
              <p className="text-xl font-bold text-orange-600">
                ${maxPurchasePriceFrom30Percent.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          
          {maxPurchasePriceFrom30Percent < maxPurchasePrice && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The 30% rule suggests a lower purchase price of ${maxPurchasePriceFrom30Percent.toLocaleString()} 
                compared to your maximum borrowing capacity. This leaves room for other expenses and financial goals.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Additional Housing Costs */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-3">Additional Monthly Housing Costs</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div className="flex justify-between">
              <span>Home Insurance:</span>
              <span>${additionalCosts.homeInsurance}</span>
            </div>
            <div className="flex justify-between">
              <span>Council Rates:</span>
              <span>${additionalCosts.councilRates}</span>
            </div>
            <div className="flex justify-between">
              <span>Utilities:</span>
              <span>${additionalCosts.utilities}</span>
            </div>
            <div className="flex justify-between">
              <span>Electricity:</span>
              <span>${additionalCosts.electricity}</span>
            </div>
            <div className="flex justify-between">
              <span>Maintenance:</span>
              <span>${additionalCosts.maintenance}</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Total Additional:</span>
              <span>${totalAdditionalCosts}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Total monthly housing cost: ${(monthlyPayment + totalAdditionalCosts).toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
        </div>

        {/* Repayment Schedule Chart */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Loan Repayment Schedule</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={repaymentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#ef4444" 
                  name="Remaining Balance"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="principalPaid" 
                  stroke="#22c55e" 
                  name="Principal Paid"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Recommendations</h3>
          
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              <strong>Consider the 30% rule:</strong> Your recommended housing budget is ${housingBudget30Percent.toLocaleString('en-US', { maximumFractionDigits: 0 })} per month, 
              which includes mortgage, insurance, rates, and utilities.
            </AlertDescription>
          </Alert>
          
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              <strong>Factor in all costs:</strong> Remember to budget an additional ${totalAdditionalCosts} per month 
              for insurance, rates, utilities, and maintenance on top of your mortgage repayment.
            </AlertDescription>
          </Alert>
        </div>

        {/* Action Items */}
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">Next Steps</h3>
          <ul className="space-y-1 text-sm text-green-800">
            <li>• Research first home buyer grants in your state (up to $10,000-$25,000)</li>
            <li>• Get pre-approval from multiple lenders to compare rates</li>
            <li>• Factor in stamp duty (2-7% of purchase price) and conveyancing costs ($1,500-$3,000)</li>
            <li>• Consider building and pest inspections ($300-$600)</li>
            <li>• Budget for moving costs and immediate home setup expenses</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default HouseBuyingCalculator;
