
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
  
  // Calculate available for housing (30% of net income is recommended)
  const recommendedHousingBudget = totalMonthlyNetIncome * 0.3;
  
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
  
  // Calculate debt-to-income ratio
  const debtToIncomeRatio = (monthlyPayment / totalMonthlyNetIncome) * 100;
  
  // Find credit card debt limits
  const creditCardDebt = assessmentData.debtDetails?.find((debt: any) => 
    debt.type === 'Credit Card'
  );
  
  const creditCardLimit = creditCardDebt ? parseFloat(creditCardDebt.balance) || 0 : 0;
  
  // Calculate improvement scenarios
  const improvementWithoutCreditCard = creditCardLimit > 0 
    ? (totalAnnualGrossIncome + creditCardLimit * 0.2) * 6 + deposit
    : maxPurchasePrice;
  
  const improvementWith20Percent = totalAnnualGrossIncome * 1.2 * 6 + deposit;

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
              <p className="text-sm text-gray-600">Maximum Loan Amount:</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Estimated Monthly Repayment:</p>
              <p className="text-xl font-semibold">
                ${monthlyPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Debt-to-Income Ratio:</p>
              <p className={`text-xl font-semibold ${debtToIncomeRatio > 30 ? 'text-red-600' : 'text-green-600'}`}>
                {debtToIncomeRatio.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">How to Improve Your Borrowing Capacity</h3>
          
          {creditCardLimit > 0 && (
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <strong>Pay off credit card debt:</strong> Reducing your credit card balance by ${creditCardLimit.toLocaleString()} 
                could increase your borrowing capacity to ${improvementWithoutCreditCard.toLocaleString()}.
              </AlertDescription>
            </Alert>
          )}
          
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              <strong>Increase your income:</strong> A 20% income increase could boost your borrowing capacity to ${improvementWith20Percent.toLocaleString()}.
            </AlertDescription>
          </Alert>
          
          {debtToIncomeRatio > 30 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Reduce expenses:</strong> Your debt-to-income ratio is above 30%, which may affect loan approval. 
                Consider reducing expenses by ${((debtToIncomeRatio - 30) / 100 * totalMonthlyNetIncome).toLocaleString()} per month.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Action Items */}
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">Next Steps</h3>
          <ul className="space-y-1 text-sm text-green-800">
            <li>• Save for a larger deposit to reduce monthly repayments</li>
            <li>• Get pre-approval from multiple lenders to compare rates</li>
            <li>• Consider location and property type within your budget</li>
            <li>• Factor in additional costs like stamp duty and legal fees</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default HouseBuyingCalculator;
