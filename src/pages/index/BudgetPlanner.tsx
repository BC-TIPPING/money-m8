
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BUDGET_CATEGORIES } from '@/lib/budgetCategories';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';


interface ExpenseItem {
    category: string;
    amount: string;
    frequency: string;
}

interface BudgetPlannerProps {
    expenseItems: ExpenseItem[];
    totalMonthlyNetIncome: number;
}

// Helper to normalize amounts to monthly
const normalizeToMonthly = (amount: number, frequency: string) => {
    switch (frequency) {
        case 'Weekly':
            return amount * 4.33;
        case 'Fortnightly':
            return amount * 2.165;
        case 'Yearly':
            return amount / 12;
        case 'Monthly':
        default:
            return amount;
    }
};

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
    
    const summaryData = useMemo(() => {
        if (!showSummary) return [];

        return goalExpenses.map(item => {
            const actual = item.actualAmount;
            const goal = parseFloat(item.goalAmount) || 0;
            const difference = goal - actual;
            const percentageChange = actual !== 0 ? (difference / actual) * 100 : (goal > 0 ? Infinity : 0);
            return {
                category: item.category,
                actual,
                goal,
                difference,
                percentageChange
            };
        }).sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
    }, [showSummary, goalExpenses]);


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
                <CardTitle>Set Your Budget Goal</CardTitle>
                <CardDescription>
                    Your current monthly expenses are listed below. Set a goal for each category to see how you can improve your budget. The suggested amounts are based on your net income.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!showSummary ? (
                    <TooltipProvider>
                    <div className="space-y-4">
                        <div className="grid grid-cols-4 items-center gap-4 font-medium px-2">
                            <span>Category</span>
                            <span className="text-center">Actual / month</span>
                            <span className="text-center">Suggested</span>
                            <span className="text-center">Goal / month</span>
                        </div>
                        {goalExpenses.map((item, index) => {
                            const categoryInfo = categoryInfoMap.get(item.category);
                            const suggestedMin = totalMonthlyNetIncome * (categoryInfo?.minPercent || 0) / 100;
                            const suggestedMax = totalMonthlyNetIncome * (categoryInfo?.maxPercent || 0) / 100;

                            return (
                                <div key={index} className="grid grid-cols-4 items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        <Label htmlFor={`goal-${index}`}>{item.category}</Label>
                                         {categoryInfo && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-3 w-3 text-muted-foreground cursor-pointer" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="max-w-xs">{categoryInfo.notes}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                        <Input
                                            id={`actual-${index}`}
                                            type="text"
                                            readOnly
                                            value={item.actualAmount.toFixed(2)}
                                            className="pl-7 bg-muted text-center"
                                        />
                                    </div>
                                    <div className="text-center text-sm text-muted-foreground">
                                        {categoryInfo && totalMonthlyNetIncome > 0 ? (
                                            <div>
                                                <p>${suggestedMin.toFixed(0)} - ${suggestedMax.toFixed(0)}</p>
                                                <p className="text-xs">({categoryInfo.minPercent}{categoryInfo.minPercent !== categoryInfo.maxPercent ? `-${categoryInfo.maxPercent}`:'' }%)</p>
                                            </div>
                                        ) : (
                                            <span>-</span>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                        <Input
                                            id={`goal-${index}`}
                                            type="number"
                                            step="0.01"
                                            value={item.goalAmount}
                                            onChange={(e) => handleGoalChange(index, e.target.value)}
                                            className="pl-7 text-center"
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    </TooltipProvider>
                ) : (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Budget Summary</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Actual</TableHead>
                                    <TableHead className="text-right">Goal</TableHead>
                                    <TableHead className="text-right">Difference</TableHead>
                                    <TableHead className="text-right">% Change</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {summaryData.map(row => (
                                    <TableRow key={row.category}>
                                        <TableCell className="font-medium">{row.category}</TableCell>
                                        <TableCell className="text-right">${row.actual.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">${row.goal.toFixed(2)}</TableCell>
                                        <TableCell className={`text-right font-medium ${row.difference > 0 ? 'text-destructive' : row.difference < 0 ? 'text-green-600' : ''}`}>
                                            {row.difference > 0 ? '+' : ''}${row.difference.toFixed(2)}
                                        </TableCell>
                                        <TableCell className={`text-right font-medium ${row.percentageChange > 0 ? 'text-destructive' : row.percentageChange < 0 ? 'text-green-600' : ''}`}>
                                            {isFinite(row.percentageChange) && row.percentageChange !== 0 ? `${row.percentageChange > 0 ? '+' : ''}${row.percentageChange.toFixed(0)}%` : (isFinite(row.percentageChange) ? '-' : 'New')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         <p className="mt-4 text-sm text-muted-foreground">
                            A <span className="text-green-600 font-semibold">green value</span> indicates a planned decrease in spending (a saving!), while a <span className="text-destructive font-semibold">red value</span> indicates a planned increase.
                        </p>
                    </div>
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
