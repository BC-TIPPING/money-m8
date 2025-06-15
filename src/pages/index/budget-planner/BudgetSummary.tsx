
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMemo } from 'react';

interface GoalExpenseItem {
  category: string;
  actualAmount: number;
  goalAmount: string;
}

interface BudgetSummaryProps {
  goalExpenses: GoalExpenseItem[];
}

export function BudgetSummary({ goalExpenses }: BudgetSummaryProps) {
  const summaryData = useMemo(() => {
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
  }, [goalExpenses]);

  return (
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
  );
}
