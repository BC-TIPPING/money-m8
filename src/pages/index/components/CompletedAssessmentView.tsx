
import React from 'react';
import { Link } from "react-router-dom";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HouseBuyingCalculator from "../HouseBuyingCalculator";
import InvestmentPropertyCalculator from "../InvestmentPropertyCalculator";
import BudgetPlanner from "../budget-planner";
import DebtReductionChart from "../DebtReductionChart";
import InterestSavedChart from "../InterestSavedChart";
import ActionItemsSection from "../ActionItemsSection";
import { calculateMonthlyAmount, calculateAustralianIncomeTax } from "@/lib/financialCalculations";

interface CompletedAssessmentViewProps {
  assessment: any;
  chartData: any;
}

const CompletedAssessmentView: React.FC<CompletedAssessmentViewProps> = ({
  assessment,
  chartData
}) => {
  const totalMonthlyGrossIncome = calculateMonthlyAmount(assessment.incomeSources);
  const totalAnnualGrossIncome = totalMonthlyGrossIncome * 12;
  const annualTax = calculateAustralianIncomeTax(totalAnnualGrossIncome);
  const totalMonthlyNetIncome = totalAnnualGrossIncome > 0 ? (totalAnnualGrossIncome - annualTax) / 12 : 0;

  return (
    <div className="container mx-auto grid gap-6 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:px-8">
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
      {assessment.goals.includes('Pay off home loan sooner') && (
        <Card>
          <CardHeader>
            <CardTitle>Pay Off Home Loan Sooner 🚀</CardTitle>
            <CardDescription>Use our calculator to see how extra repayments can save you thousands!</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link to="/pay-off-home-loan">Open Calculator</Link>
            </Button>
          </CardFooter>
        </Card>
      )}
      {assessment.goals.includes('Maximise super') && (
        <Card>
          <CardHeader>
            <CardTitle>Maximise Super 💰</CardTitle>
            <CardDescription>Use our calculator to see how extra contributions can boost your retirement savings and lower your tax.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link to="/maximise-super">Open Calculator</Link>
            </Button>
          </CardFooter>
        </Card>
      )}
      {assessment.goals.includes('Set a budget') && (
        <BudgetPlanner expenseItems={assessment.expenseItems} totalMonthlyNetIncome={totalMonthlyNetIncome} />
      )}
      {chartData?.debtReductionData && <DebtReductionChart data={chartData.debtReductionData} />}
      {chartData?.interestSavedData && <InterestSavedChart data={chartData.interestSavedData} />}
      <ActionItemsSection assessmentData={assessment} />
    </div>
  );
};

export default CompletedAssessmentView;
