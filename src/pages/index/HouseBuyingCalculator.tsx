
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, TrendingUp, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { calculateMonthlyAmount } from "@/lib/financialCalculations";

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
  
  // Calculate current rent/mortgage from expenses
  const currentHousingExpense = calculateMonthlyAmount(
    (assessmentData.expenseItems || []).filter((item: any) => 
      item.category === 'Housing (Rent/Mortgage)' || 
      item.category === 'Housing' || 
      item.category === 'Rent'
    )
  );
  
  // Calculate non-housing expenses
  const nonHousingExpenses = totalMonthlyExpenses - currentHousingExpense;
  
  // Calculate savings from expense items
  const monthlySavings = calculateMonthlyAmount(
    (assessmentData.expenseItems || []).filter((item: any) => 
      item.category === 'Savings' || 
      item.category === 'Investments'
    )
  );
  
  // Use 30% debt-to-income ratio only
  const maxHousingPayment = totalMonthlyNetIncome * 0.3;
  
  // Budget surplus = income - expenses
  const budgetSurplus = totalMonthlyNetIncome - totalMonthlyExpenses;
  
  // Calculate reduction in current expenses needed
  // What they have available: budget surplus + savings + current rent
  const currentlyAvailable = budgetSurplus + monthlySavings + currentHousingExpense;
  const reductionInExpenses = Math.max(0, maxHousingPayment - currentlyAvailable);
  
  // Calculate how much needs to be cut from budget to afford the mortgage
  const availableAfterMortgage = totalMonthlyNetIncome - maxHousingPayment;
  const expensesToCut = Math.max(0, nonHousingExpenses - availableAfterMortgage);
  
  // Calculate maximum loan amount based on 30% debt-to-income ratio
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;
  const maxLoanAmount = maxHousingPayment > 0 
    ? (maxHousingPayment * (Math.pow(1 + monthlyRate, numPayments) - 1)) / 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments))
    : 0;
  
  // Calculate maximum purchase price
  const maxPurchasePrice = maxLoanAmount + deposit;
  
  // Calculate monthly payment for max loan
  const monthlyPayment = maxLoanAmount > 0 
    ? (maxLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1)
    : 0;
  
  // Calculate debt-to-income ratio
  const debtToIncomeRatio = (monthlyPayment / totalMonthlyNetIncome) * 100;
  
  // Find credit card debt limits
  const creditCardDebt = assessmentData.debtDetails?.find((debt: any) => 
    debt.type === 'Credit Card'
  );
  
  const creditCardLimit = creditCardDebt ? parseFloat(creditCardDebt.balance) || 0 : 0;
  
  // Calculate improvement scenarios
  const improvementWithoutCreditCard = creditCardLimit > 0 
    ? maxPurchasePrice + (creditCardLimit * 0.5) // Rough estimate of increased capacity
    : maxPurchasePrice;
  
  const improvementWith20Percent = totalMonthlyNetIncome * 1.2 * 0.3; // 20% income increase
  const improvedLoanAmount = improvementWith20Percent > 0 
    ? (improvementWith20Percent * (Math.pow(1 + monthlyRate, numPayments) - 1)) / 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments))
    : 0;
  const improvementWith20PercentPrice = improvedLoanAmount + deposit;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          House Buying Calculator 🏠
        </CardTitle>
        <CardDescription>
          Based on the 30% debt-to-income ratio rule, here's what you could potentially afford for a home.
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
          <h3 className="font-semibold text-lg text-blue-900">Your Borrowing Capacity (30% Rule)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Maximum Monthly Payment:</p>
              <p className="text-2xl font-bold text-green-600">
                ${maxHousingPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Maximum Purchase Price:</p>
              <p className="text-2xl font-bold text-blue-600">
                ${maxPurchasePrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-gray-500">Based on {loanTerm}-year loan at {interestRate}% with ${deposit.toLocaleString()} deposit</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Reduction in Current Expenses:</p>
              <p className={`text-2xl font-bold ${reductionInExpenses > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                {reductionInExpenses > 0 
                  ? `$${reductionInExpenses.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                  : 'None needed!'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Financial Health Check */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Net Monthly Income</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${totalMonthlyNetIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Non-Housing Expenses</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${nonHousingExpenses.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Available After Mortgage</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${availableAfterMortgage.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className={expensesToCut > 0 ? "border-amber-300 bg-amber-50" : "border-green-300 bg-green-50"}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Expenses to Cut</p>
                <p className={`text-lg font-semibold ${expensesToCut > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                  {expensesToCut > 0 
                    ? `$${expensesToCut.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                    : 'None needed!'
                  }
                </p>
                {expensesToCut > 0 && (
                  <p className="text-xs text-gray-500 mt-1">Excluding rent</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">How to Improve Your Buying Power</h3>
          
          {creditCardLimit > 0 && (
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <strong>Pay off credit card debt:</strong> Reducing your credit card balance could 
                increase your borrowing capacity to approximately ${improvementWithoutCreditCard.toLocaleString()}.
              </AlertDescription>
            </Alert>
          )}
          
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              <strong>Increase your income:</strong> A 20% income increase could boost your maximum 
              purchase price to ${improvementWith20PercentPrice.toLocaleString()}.
            </AlertDescription>
          </Alert>
          
          {totalMonthlyExpenses > totalMonthlyNetIncome * 0.7 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Reduce expenses:</strong> Your current expenses are high relative to income. 
                Consider reducing non-essential spending to improve your financial position.
              </AlertDescription>
            </Alert>
          )}
          
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              <strong>Save a larger deposit:</strong> Every $10,000 extra in deposit increases your 
              buying power by $10,000 and reduces your monthly payments.
            </AlertDescription>
          </Alert>
        </div>

        {/* Action Items */}
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">Next Steps to Homeownership</h3>
          <ul className="space-y-1 text-sm text-green-800">
            <li>• Get pre-approval from multiple lenders to compare rates</li>
            <li>• Factor in additional costs: stamp duty, legal fees, building inspection</li>
            <li>• Consider location and property type within your budget range</li>
            <li>• Build your deposit while house hunting to improve your position</li>
            <li>• Maintain stable employment and good credit score</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default HouseBuyingCalculator;
