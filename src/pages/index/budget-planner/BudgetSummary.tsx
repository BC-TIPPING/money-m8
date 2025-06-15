
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMemo } from 'react';

interface GoalExpenseItem {
  category: string;
  actualAmount: number;
  goalAmount: string;
}

interface BudgetSummaryProps {
  goalExpenses: GoalExpenseItem[];
  totalMonthlyNetIncome: number;
  categoryInfoMap: Map<string, { minPercent: number; maxPercent: number }>;
}

export function BudgetSummary({ goalExpenses, totalMonthlyNetIncome, categoryInfoMap }: BudgetSummaryProps) {
  const summaryData = useMemo(() => {
    if (totalMonthlyNetIncome <= 0) {
      return goalExpenses.map(item => ({
        category: item.category,
        actual: item.actualAmount,
        goal: parseFloat(item.goalAmount) || 0,
        difference: (parseFloat(item.goalAmount) || 0) - item.actualAmount,
        vsGuideline: '-',
        isOver: false,
        actualPercentage: 0
      })).sort((a,b) => b.actual - a.actual);
    }

    return goalExpenses.map(item => {
      const actual = item.actualAmount;
      const goal = parseFloat(item.goalAmount) || 0;
      const difference = goal - actual;
      
      const categoryInfo = categoryInfoMap.get(item.category);
      const actualPercentage = (actual / totalMonthlyNetIncome) * 100;
      
      let vsGuideline: React.ReactNode = '-';
      let isOver = false;

      if (categoryInfo) {
        const { minPercent, maxPercent } = categoryInfo;
        isOver = actualPercentage > maxPercent;
        
        vsGuideline = (
          <div className="flex flex-col items-end">
            <span className={isOver ? 'text-destructive font-semibold' : 'text-foreground'}>
              {actualPercentage.toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">
              (Guide: {minPercent}-{maxPercent}%)
            </span>
          </div>
        );
      }
      
      return {
        category: item.category,
        actual,
        goal,
        difference,
        vsGuideline,
        isOver,
        actualPercentage
      };
    }).sort((a, b) => {
        if (a.isOver && !b.isOver) return -1;
        if (!a.isOver && b.isOver) return 1;
        return (b.actualPercentage || 0) - (a.actualPercentage || 0);
    });
  }, [goalExpenses, totalMonthlyNetIncome, categoryInfoMap]);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Actual</TableHead>
            <TableHead className="text-right">vs Guideline</TableHead>
            <TableHead className="text-right">Goal</TableHead>
            <TableHead className="text-right">Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {summaryData.map(row => (
            <TableRow key={row.category}>
              <TableCell className="font-medium">{row.category}</TableCell>
              <TableCell className="text-right">${row.actual.toFixed(2)}</TableCell>
              <TableCell className="text-right">{row.vsGuideline}</TableCell>
              <TableCell className="text-right">${row.goal.toFixed(2)}</TableCell>
              <TableCell className={`text-right font-medium ${row.difference > 0 ? 'text-destructive' : row.difference < 0 ? 'text-green-600' : ''}`}>
                {row.difference > 0 ? '+' : ''}{row.difference.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="mt-4 text-sm text-muted-foreground">
        Spending over the guideline percentage is highlighted in <span className="text-destructive font-semibold">red</span>. A <span className="text-green-600 font-semibold">green 'Change'</span> indicates a planned saving.
      </p>
    </div>
  );
}

