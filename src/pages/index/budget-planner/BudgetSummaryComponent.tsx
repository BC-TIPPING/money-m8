
import React from 'react';
import { calculateMonthlyAmount } from '@/lib/financialCalculations';

interface BudgetSummaryComponentProps {
  budgetItems: Array<{
    category: string;
    amount: string;
    frequency: string;
  }>;
  totalMonthlyNetIncome: number;
}

export const BudgetSummaryComponent: React.FC<BudgetSummaryComponentProps> = ({
  budgetItems,
  totalMonthlyNetIncome
}) => {
  const totalMonthlyExpenses = calculateMonthlyAmount(budgetItems);
  const monthlySavings = totalMonthlyNetIncome - totalMonthlyExpenses;
  const savingsPercentage = totalMonthlyNetIncome > 0 ? (monthlySavings / totalMonthlyNetIncome) * 100 : 0;

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
      <h4 className="font-semibold">Budget Summary</h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Monthly Net Income:</span>
          <span className="ml-2 font-medium">${totalMonthlyNetIncome.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-gray-600">Monthly Expenses:</span>
          <span className="ml-2 font-medium">${totalMonthlyExpenses.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-gray-600">Monthly Savings:</span>
          <span className={`ml-2 font-medium ${monthlySavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${monthlySavings.toFixed(2)}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Savings Rate:</span>
          <span className={`ml-2 font-medium ${savingsPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {savingsPercentage.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};
