
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

interface BudgetRecapProps {
  totalMonthlyNetIncome: number;
  totalMonthlyExpenses: number;
  expenseItems: { category: string; amount: string; frequency: string }[];
}

const BudgetRecap: React.FC<BudgetRecapProps> = ({ 
  totalMonthlyNetIncome, 
  totalMonthlyExpenses, 
  expenseItems 
}) => {
  // Australian budget guidelines (as % of net income) - mapped to survey categories
  const australianBudgetGuidelines = {
    'Housing (Rent/Mortgage)': { min: 25, max: 35, category: 'Housing' },
    'Food & Groceries': { min: 10, max: 15, category: 'Food' },
    'Utilities': { min: 3, max: 8, category: 'Utilities' },
    'Transport': { min: 5, max: 10, category: 'Transport' },
    'Insurance': { min: 2, max: 5, category: 'Insurance' },
    'Entertainment & Subscriptions': { min: 2, max: 5, category: 'Entertainment' },
    'Clothing & Personal Care': { min: 2, max: 5, category: 'Clothing' },
    'Health & Medical': { min: 3, max: 6, category: 'Healthcare' },
    'Savings & Investments': { min: 5, max: 15, category: 'Savings' },
    'Travel & Holidays': { min: 3, max: 8, category: 'Travel' },
    'Debt Repayments': { min: 5, max: 10, category: 'Debt' },
    'Children & Education': { min: 5, max: 10, category: 'Education' },
    'Pets': { min: 1, max: 3, category: 'Pets' },
    'Hobbies & Fitness': { min: 2, max: 4, category: 'Fitness' },
    'Gifts & Donations': { min: 1, max: 3, category: 'Gifts' },
    'Miscellaneous': { min: 1, max: 3, category: 'Miscellaneous' },
  };

  const calculateCategorySpending = (category: string) => {
    const relevantExpenses = expenseItems.filter(item => 
      item.category === category && 
      item.amount && 
      !isNaN(parseFloat(item.amount))
    );
    
    return relevantExpenses.reduce((sum, item) => {
      const amount = parseFloat(item.amount);
      const multiplier = item.frequency === 'Weekly' ? 4.33 : 
                        item.frequency === 'Fortnightly' ? 2.165 : 
                        item.frequency === 'Yearly' ? 1/12 : 1;
      return sum + (amount * multiplier);
    }, 0);
  };

  const budgetAnalysis = Object.entries(australianBudgetGuidelines).map(([category, guideline]) => {
    const actualSpending = calculateCategorySpending(category);
    const actualPercentage = totalMonthlyNetIncome > 0 ? (actualSpending / totalMonthlyNetIncome) * 100 : 0;
    
    let status: 'good' | 'warning' | 'over' | 'under' = 'good';
    
    // Special handling for Savings & Investments - over is good, under is bad
    if (category === 'Savings & Investments') {
      if (actualPercentage > guideline.max) status = 'good'; // Over is good for savings
      else if (actualPercentage < guideline.min) status = 'under'; // Under is bad for savings
    } else {
      if (actualPercentage > guideline.max) status = 'over';
      else if (actualPercentage < guideline.min) status = 'under';
    }
    
    return {
      category,
      actualSpending,
      actualPercentage,
      guideline,
      status,
    };
  });

  // Calculate savings rate: (surplus + Savings & Investments) / income
  const actualSavingsSpending = calculateCategorySpending('Savings & Investments');
  const monthlySurplus = totalMonthlyNetIncome - totalMonthlyExpenses;
  const savingsRate = totalMonthlyNetIncome > 0 ? ((monthlySurplus + actualSavingsSpending) / totalMonthlyNetIncome) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'under': return 'bg-yellow-100 text-yellow-800';
      case 'over': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'under': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'over': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <Card className="w-full card-mobile">
      <CardHeader>
        <CardTitle className="text-responsive-xl">Budget Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 form-mobile">

        {/* Monthly Budget Summary */}
        <div className="grid grid-mobile-single gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Monthly Net Income</p>
            <p className="text-xl font-bold text-green-600">${totalMonthlyNetIncome.toLocaleString()}</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Monthly Expenses</p>
            <p className="text-xl font-bold text-red-600">${totalMonthlyExpenses.toLocaleString()}</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Monthly Surplus</p>
            <p className={`text-xl font-bold ${monthlySurplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${monthlySurplus.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-900 mb-2 text-responsive-lg">Budget Recommendations</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            {budgetAnalysis.filter(item => item.status === 'over').map((item, index) => (
              <li key={index}>• {item.category} is over-indexed by ${((item.actualPercentage - item.guideline.max) * totalMonthlyNetIncome / 100).toFixed(0)}/month</li>
            ))}
            {budgetAnalysis.filter(item => item.status === 'under').map((item, index) => (
              <li key={index}>• {item.category} is under-indexed by ${((item.guideline.min - item.actualPercentage) * totalMonthlyNetIncome / 100).toFixed(0)}/month</li>
            ))}
            {savingsRate < 10 && (
              <li>• Increase savings rate to at least 10% (${(totalMonthlyNetIncome * 0.1).toFixed(0)}/month)</li>
            )}
            {budgetAnalysis.filter(item => item.status === 'over').length === 0 && savingsRate >= 10 && savingsRate < 20 && (
              <li>• Your budget is well-balanced! Consider increasing savings rate to 15-20%</li>
            )}
            {budgetAnalysis.filter(item => item.status === 'over').length === 0 && savingsRate >= 20 && (
              <li>• Excellent budget management! Your savings rate is above 20%</li>
            )}
          </ul>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2 text-responsive-lg">Savings Rate Analysis</h4>
          <p className="text-sm text-blue-800 mb-3">
            Your savings rate is one of the most critical indicators of financial health and future wealth-building potential. 
            A healthy savings rate of 10-20% creates the foundation for financial security by building an emergency fund, 
            funding retirement goals, and providing capital for investments. It acts as a buffer against unexpected expenses 
            and economic downturns while enabling you to take advantage of investment opportunities. The higher your savings rate, 
            the faster you can achieve financial independence and the more resilient you become to financial shocks.
          </p>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>Current Rate:</strong> {savingsRate.toFixed(1)}%</p>
            <p>• <strong>Target Rate:</strong> 10-20% (Financial experts recommend)</p>
            <p>• <strong>Australian Average:</strong> 8.6% (ABS data)</p>
            {monthlySurplus < 0 && (
              <p className="text-red-600 font-medium">⚠️ You're spending more than you earn. Consider reviewing expenses.</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-responsive-lg">Budget Category Analysis</h4>
          <div className="space-y-2">
            {budgetAnalysis.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <p className="font-medium text-responsive">{item.category}</p>
                    <p className="text-sm text-muted-foreground">
                      ${item.actualSpending.toFixed(0)} ({item.actualPercentage.toFixed(1)}%)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(item.status)}>
                    {item.status === 'good' ? (item.category === 'Savings & Investments' && item.actualPercentage > item.guideline.max ? 'Excellent' : 'On Track') : 
                     item.status === 'under' ? 'Under' : 'Over'}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Target: {item.guideline.min}-{item.guideline.max}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetRecap;
