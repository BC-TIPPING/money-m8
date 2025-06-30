
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PiggyBank, TrendingUp } from 'lucide-react';
import BudgetCategoryRow from './BudgetCategoryRow';
import BudgetSummary from './BudgetSummary';
import BudgetGoalForm from './BudgetGoalForm';

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
  const [budgetGoals, setBudgetGoals] = useState<Array<{
    category: string;
    currentAmount: number;
    targetAmount: number;
    priority: 'high' | 'medium' | 'low';
  }>>([]);

  const updateBudgetItem = (index: number, field: string, value: string) => {
    const updatedItems = [...budgetItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setBudgetItems(updatedItems);
  };

  const handleCreateBudget = () => {
    setShowGoalForm(true);
  };

  if (showGoalForm) {
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
            budgetItems={budgetItems}
            totalMonthlyNetIncome={totalMonthlyNetIncome}
            budgetGoals={budgetGoals}
            setBudgetGoals={setBudgetGoals}
            onBack={() => setShowGoalForm(false)}
          />
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
          {budgetItems.map((item, index) => (
            <BudgetCategoryRow
              key={index}
              category={item.category}
              amount={item.amount}
              frequency={item.frequency}
              onUpdate={(field, value) => updateBudgetItem(index, field, value)}
            />
          ))}
        </div>

        <BudgetSummary 
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
