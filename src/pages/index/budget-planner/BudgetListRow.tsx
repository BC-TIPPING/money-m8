
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BudgetListRowProps {
  category: string;
  amount: string;
  frequency: string;
  onUpdate: (field: string, value: string) => void;
}

export const BudgetListRow: React.FC<BudgetListRowProps> = ({
  category,
  amount,
  frequency,
  onUpdate
}) => {
  return (
    <div className="grid grid-cols-3 gap-4 items-center">
      <div className="font-medium">{category}</div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
        <Input
          type="number"
          value={amount}
          onChange={(e) => onUpdate('amount', e.target.value)}
          placeholder="0.00"
          className="pl-7"
        />
      </div>
      <Select value={frequency} onValueChange={(value) => onUpdate('frequency', value)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Weekly">Weekly</SelectItem>
          <SelectItem value="Fortnightly">Fortnightly</SelectItem>
          <SelectItem value="Monthly">Monthly</SelectItem>
          <SelectItem value="Yearly">Yearly</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
