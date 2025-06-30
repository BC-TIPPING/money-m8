
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BUDGET_CATEGORIES } from '@/lib/budgetCategories';
import { normalizeToMonthly } from '@/lib/financialCalculations';
import { BudgetGoalForm } from './BudgetGoalForm';
import { BudgetSummary } from './BudgetSummary';

interface ExpenseItem {
    category: string;
    amount: string;
    frequency: string;
}

interface BudgetPlannerProps {
    expenseItems: ExpenseItem[];
    totalMonthlyNetIncome: number;
}

export default function BudgetPlanner({ expenseItems, totalMonthlyNetIncome }: BudgetPlannerProps) {
    const normalizedActualExpenses = useMemo(() => {
        return (expenseItems || [])
            .filter(item => item.category && item.amount)
            .map(item => ({
                ...item,
                monthlyAmount: normalizeToMonthly(parseFloat(item.amount) || 0, item.frequency)
            }));
    }, [expenseItems]);

    const [goalExpenses, setGoalExpenses] = useState(
        normalizedActualExpenses.map(item => ({ 
            category: item.category,
            actualAmount: item.monthlyAmount,
            goalAmount: item.monthlyAmount.toFixed(2)
        }))
    );
    const [showSummary, setShowSummary] = useState(false);

    const categoryInfoMap = useMemo(() => {
        const map = new Map<string, { minPercent: number, maxPercent: number, notes: string }>();
        BUDGET_CATEGORIES.forEach(item => {
            map.set(item.category, { minPercent: item.minPercent, maxPercent: item.maxPercent, notes: item.notes });
        });
        return map;
    }, []);

    const handleGoalChange = (index: number, value: string) => {
        const newGoalExpenses = [...goalExpenses];
        newGoalExpenses[index].goalAmount = value;
        setGoalExpenses(newGoalExpenses);
    };

    const totalActual = useMemo(() => normalizedActualExpenses.reduce((sum, item) => sum + item.monthlyAmount, 0), [normalizedActualExpenses]);
    const totalGoal = useMemo(() => goalExpenses.reduce((sum, item) => sum + (parseFloat(item.goalAmount) || 0), 0), [goalExpenses]);
    
    if (!expenseItems || expenseItems.length === 0 || expenseItems.every(i => !i.amount)) {
        return (
             <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Set Your Budget Goal</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">You haven't entered any expenses in your assessment. Please go back and add some expenses to use the budget planner.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>{showSummary ? 'Budget Analysis' : 'Set Your Budget Goal'}</CardTitle>
                <CardDescription>
                    {showSummary 
                        ? "Here's how your current spending compares to general budget guidelines. Over-budget items are highlighted."
                        : "Your current monthly expenses are listed below. Set a goal for each category to see how you can improve your budget. The suggested amounts are based on your net income."
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!showSummary ? (
                    <BudgetGoalForm 
                        goalExpenses={goalExpenses}
                        handleGoalChange={handleGoalChange}
                        categoryInfoMap={categoryInfoMap}
                        totalMonthlyNetIncome={totalMonthlyNetIncome}
                    />
                ) : (
                    <BudgetSummary 
                        goalExpenses={goalExpenses} 
                        totalMonthlyNetIncome={totalMonthlyNetIncome}
                        categoryInfoMap={categoryInfoMap}
                    />
                )}
            </CardContent>
            <CardFooter className="flex justify-between items-center bg-muted/50 py-4 px-6 rounded-b-lg">
                 <div className="text-sm">
                    <p>Total Actual: <span className="font-bold">${totalActual.toFixed(2)}</span> / month</p>
                    <p>Total Goal: <span className="font-bold">${totalGoal.toFixed(2)}</span> / month</p>
                </div>
                {showSummary ? (
                     <Button variant="outline" onClick={() => setShowSummary(false)}>Edit Goals</Button>
                ) : (
                    <Button onClick={() => setShowSummary(true)}>Analyze Budget</Button>
                )}
            </CardFooter>
        </Card>
    );
}
