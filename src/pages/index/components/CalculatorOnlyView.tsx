
import React from 'react';
import { Button } from "@/components/ui/button";
import HouseBuyingCalculator from "../HouseBuyingCalculator";
import InvestmentPropertyCalculator from "../InvestmentPropertyCalculator";
import { calculateMonthlyAmount, calculateAustralianIncomeTax } from "@/lib/financialCalculations";

interface CalculatorOnlyViewProps {
  assessment: any;
  onFullAnalysis: () => void;
}

const CalculatorOnlyView: React.FC<CalculatorOnlyViewProps> = ({
  assessment,
  onFullAnalysis
}) => {
  const totalMonthlyGrossIncome = calculateMonthlyAmount(assessment.incomeSources);
  const totalAnnualGrossIncome = totalMonthlyGrossIncome * 12;
  const annualTax = calculateAustralianIncomeTax(totalAnnualGrossIncome);
  const totalMonthlyNetIncome = totalAnnualGrossIncome > 0 ? (totalAnnualGrossIncome - annualTax) / 12 : 0;

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
      <div className="grid gap-6 lg:grid-cols-1">
        {assessment.goals.includes('Buy a house') && (
          <HouseBuyingCalculator 
            assessmentData={assessment}
            totalMonthlyNetIncome={totalMonthlyNetIncome}
            totalAnnualGrossIncome={totalAnnualGrossIncome}
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
