
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface BudgetCategoryRowProps {
  item: {
    category: string;
    actualAmount: number;
    goalAmount: string;
  };
  index: number;
  handleGoalChange: (index: number, value: string) => void;
  categoryInfo: { minPercent: number; maxPercent: number; notes: string } | undefined;
  totalMonthlyNetIncome: number;
}

export function BudgetCategoryRow({ item, index, handleGoalChange, categoryInfo, totalMonthlyNetIncome }: BudgetCategoryRowProps) {
  const suggestedMin = totalMonthlyNetIncome * (categoryInfo?.minPercent || 0) / 100;
  const suggestedMax = totalMonthlyNetIncome * (categoryInfo?.maxPercent || 0) / 100;

  return (
    <div className="grid grid-cols-4 items-center gap-4">
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
  );
}
