
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HouseBuyingCalculator from "../HouseBuyingCalculator";
import InvestmentPropertyCalculator from "../InvestmentPropertyCalculator";

interface CalculatorOnlyViewProps {
  assessment: any;
  onFullAnalysis: () => void;
}

const CalculatorOnlyView: React.FC<CalculatorOnlyViewProps> = ({
  assessment,
  onFullAnalysis
}) => {
  // For calculator-only mode, we need basic income input since we don't have survey data
  const [monthlyIncome, setMonthlyIncome] = React.useState<number>(0);
  const [annualIncome, setAnnualIncome] = React.useState<number>(0);

  // Create mock assessment data for calculator
  const calculatorAssessment = {
    ...assessment,
    incomeSources: [{ category: "Primary Income", amount: monthlyIncome.toString(), frequency: "Monthly" }]
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">
          {assessment.goals[0]} Calculator
        </h2>
        <Button 
          onClick={onFullAnalysis}
          variant="outline"
          className="mb-4"
        >
          Get Full Financial Analysis
        </Button>
      </div>

      {/* Income Input for Calculator */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Income Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="monthly-income">Monthly Net Income</Label>
            <Input
              id="monthly-income"
              type="number"
              value={monthlyIncome || ''}
              onChange={(e) => setMonthlyIncome(Number(e.target.value))}
              placeholder="Enter your monthly net income"
            />
          </div>
          <div>
            <Label htmlFor="annual-income">Annual Gross Income</Label>
            <Input
              id="annual-income"
              type="number"
              value={annualIncome || ''}
              onChange={(e) => setAnnualIncome(Number(e.target.value))}
              placeholder="Enter your annual gross income"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-1">
        {assessment.goals.includes('Buy a house') && (
          <HouseBuyingCalculator 
            assessmentData={calculatorAssessment}
            totalMonthlyNetIncome={monthlyIncome}
            totalAnnualGrossIncome={annualIncome}
          />
        )}
        {assessment.goals.includes('Buy an investment property') && (
          <InvestmentPropertyCalculator />
        )}
      </div>
    </div>
  );
};

export default CalculatorOnlyView;
