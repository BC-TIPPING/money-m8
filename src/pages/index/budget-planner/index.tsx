
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PiggyBank, TrendingUp } from 'lucide-react';
import { BudgetListRow } from './BudgetListRow';
import { BudgetSummaryComponent } from './BudgetSummaryComponent';
import { BudgetGoalForm } from './BudgetGoalForm';
import { BUDGET_CATEGORY_INFO } from '@/lib/budgetCategories';
import { calculateMonthlyAmount } from '@/lib/financialCalculations';

interface BudgetPlannerProps {
  expenseItems: Array<{
    category: string;
    amount: string;
    frequency: string;
  }>;
  totalMonthlyNetIncome: number;
}

const BudgetPlanner: React.FC<BudgetPlannerProps> = ({ expenseItems, totalMonthlyNetIncome }) => {
  const [budgetItems, setBudgetItems] = useState(expenseItems);
  const [showGoalForm, setShowGoalForm] = useState(false);

  const updateBudgetItem = (index: number, field: string, value: string) => {
    const updatedItems = [...budgetItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setBudgetItems(updatedItems);
  };

  const handleCreateBudget = () => {
    setShowGoalForm(true);
  };

  if (showGoalForm) {
    // Transform budget items to goal expenses format
    const goalExpenses = budgetItems
      .filter(item => item.amount && parseFloat(item.amount) > 0)
      .map(item => ({
        category: item.category,
        actualAmount: calculateMonthlyAmount([item]),
        goalAmount: calculateMonthlyAmount([item]).toString()
      }));

    const categoryInfoMap = new Map(
      Object.entries(BUDGET_CATEGORY_INFO || {}).map(([key, value]) => [key, value])
    );

    const handleGoalChange = (index: number, value: string) => {
      // This would be handled by the BudgetGoalForm component
      console.log('Goal changed:', index, value);
    };

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Set Your Budget Goals
          </CardTitle>
          <CardDescription>
            Create specific targets for your spending categories to improve your financial health.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BudgetGoalForm 
            goalExpenses={goalExpenses}
            handleGoalChange={handleGoalChange}
            categoryInfoMap={categoryInfoMap}
            totalMonthlyNetIncome={totalMonthlyNetIncome}
          />
          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={() => setShowGoalForm(false)}>
              Back to Budget
            </Button>
            <Button>
              Save Budget Goals
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5" />
          Budget Planner 📊
        </CardTitle>
        <CardDescription>
          Review and adjust your monthly spending to optimize your budget. Click "Create My Budget" to set specific goals.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Monthly Expenses</h3>
          <div className="grid grid-cols-3 gap-4 font-medium text-sm text-gray-600 px-2">
            <span>Category</span>
            <span>Amount</span>
            <span>Frequency</span>
          </div>
          {budgetItems.map((item, index) => (
            <BudgetListRow
              key={index}
              category={item.category}
              amount={item.amount}
              frequency={item.frequency}
              onUpdate={(field, value) => updateBudgetItem(index, field, value)}
            />
          ))}
        </div>

        <BudgetSummaryComponent 
          budgetItems={budgetItems}
          totalMonthlyNetIncome={totalMonthlyNetIncome}
        />

        <div className="flex justify-center pt-4">
          <Button onClick={handleCreateBudget} size="lg" className="w-full sm:w-auto">
            <TrendingUp className="mr-2 h-4 w-4" />
            Create My Budget Goals
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetPlanner;
