
import { TooltipProvider } from "@/components/ui/tooltip";
import { BudgetCategoryRow } from "./BudgetCategoryRow";

interface GoalExpenseItem {
  category: string;
  actualAmount: number;
  goalAmount: string;
}

interface BudgetGoalFormProps {
  goalExpenses: GoalExpenseItem[];
  handleGoalChange: (index: number, value: string) => void;
  categoryInfoMap: Map<string, { minPercent: number; maxPercent: number; notes: string }>;
  totalMonthlyNetIncome: number;
}

export function BudgetGoalForm({ goalExpenses, handleGoalChange, categoryInfoMap, totalMonthlyNetIncome }: BudgetGoalFormProps) {
  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="grid grid-cols-4 items-center gap-4 font-medium px-2">
          <span>Category</span>
          <span className="text-center">Actual / month</span>
          <span className="text-center">Suggested</span>
          <span className="text-center">Goal / month</span>
        </div>
        {goalExpenses.map((item, index) => (
          <BudgetCategoryRow
            key={index}
            item={item}
            index={index}
            handleGoalChange={handleGoalChange}
            categoryInfo={categoryInfoMap.get(item.category)}
            totalMonthlyNetIncome={totalMonthlyNetIncome}
          />
        ))}
      </div>
    </TooltipProvider>
  );
}
