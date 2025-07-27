
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, TrendingUp, PiggyBank, Home, DollarSign, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAssessmentData } from "./index/hooks/useAssessmentData";
import { useAssessmentState } from "./index/assessmentHooks";
import AssessmentStepper from "./index/AssessmentStepper";
import FullFinancialHealthCheck from "./index/FullFinancialHealthCheck";
import LandingSection from "./index/LandingSection";
import ActionItemsSection from "./index/ActionItemsSection";
import InvestmentGrowthCalculator from "./index/InvestmentGrowthCalculator";
import HouseBuyingCalculator from "./index/HouseBuyingCalculator";
import DebtSnowballCalculator from "./index/DebtSnowballCalculator";
import InvestmentPropertyCalculator from "./index/InvestmentPropertyCalculator";
import BudgetPlanner from "./index/budget-planner";
import AISearchSection from "./index/components/AISearchSection";
import GoalNavigationHeader from "./index/components/GoalNavigationHeader";
import HeaderButtons from "./index/components/HeaderButtons";
import FloatingActionButtons from "./index/components/FloatingActionButtons";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { calculateMonthlyAmount } from "@/lib/financialCalculations";

export default function Index() {
  const assessment = useAssessmentState();
  const data = useAssessmentData(assessment);
  const { user, signOut } = useAuth();

  const handleGoalSelect = (goal: string, startAssessment: boolean = false) => {
    if (assessment.goals.includes(goal)) {
      toast("Goal Already Selected", {
        description: `You've already selected "${goal}". Check your results below.`
      });
      return;
    }

    const newGoals = [...assessment.goals, goal];
    assessment.setGoals(newGoals);
    
    if (startAssessment) {
      assessment.setShowAssessment(true);
    }
    
    toast("Goal Selected", {
      description: `Added "${goal}" to your goals. ${startAssessment ? 'Starting assessment...' : ''}`
    });
  };

  const showResults = assessment.goals.length > 0 && data.isComplete;
  const showFullHealthCheck = assessment.goals.includes('Full Financial Health Check') && data.isComplete;

  // Calculate financial metrics for components
  const totalMonthlyNetIncome = calculateMonthlyAmount(assessment.incomeSources) * 0.8; // Rough net income estimate
  const totalAnnualGrossIncome = calculateMonthlyAmount(assessment.incomeSources) * 12;
  const totalMonthlyExpenses = calculateMonthlyAmount(assessment.expenseItems);
  const totalMonthlySurplus = totalMonthlyNetIncome - totalMonthlyExpenses;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-700 to-emerald-800">
      <div className="container mx-auto px-4 py-8">
        <HeaderButtons user={user} onSignOut={signOut} />
        
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Your Financial Future Starts Here
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Get personalized financial advice powered by AI, designed for Australians
          </p>
          
          <AISearchSection 
            onGoalSuggested={(goal) => handleGoalSelect(goal, true)}
          />
        </div>

        {assessment.goals.length > 0 && (
          <GoalNavigationHeader 
            currentGoals={assessment.goals}
            onBackToGoals={data.handleChangeGoal}
            showBackButton={true}
          />
        )}

        {!assessment.showAssessment && assessment.goals.length === 0 && (
          <LandingSection onStartAssessment={handleGoalSelect} isLoading={false} />
        )}

        {assessment.showAssessment && !data.isComplete && (
          <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
            <AssessmentStepper
              step={assessment.step}
              setStep={assessment.setStep}
              showAssessment={assessment.showAssessment}
              setShowAssessment={assessment.setShowAssessment}
              goals={assessment.goals}
              setGoals={assessment.setGoals}
              otherGoal={assessment.otherGoal}
              setOtherGoal={assessment.setOtherGoal}
              debtTypes={assessment.debtTypes}
              setDebtTypes={assessment.setDebtTypes}
              debtDetails={assessment.debtDetails}
              setDebtDetails={assessment.setDebtDetails}
              investmentExperience={assessment.investmentExperience}
              setInvestmentExperience={assessment.setInvestmentExperience}
              hasRegularIncome={assessment.hasRegularIncome}
              setHasRegularIncome={assessment.setHasRegularIncome}
              incomeSources={assessment.incomeSources}
              setIncomeSources={assessment.setIncomeSources}
              expenseItems={assessment.expenseItems}
              setExpenseItems={assessment.setExpenseItems}
              uploadedFile={assessment.uploadedFile}
              setUploadedFile={assessment.setUploadedFile}
              fileInputRef={assessment.fileInputRef}
              postcode={assessment.postcode}
              setPostcode={assessment.setPostcode}
              age={assessment.age}
              setAge={assessment.setAge}
              superBalance={assessment.superBalance}
              setSuperBalance={assessment.setSuperBalance}
              insurances={assessment.insurances}
              setInsurances={assessment.setInsurances}
            />
          </div>
        )}

        {showFullHealthCheck && (
          <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
            <FullFinancialHealthCheck
              age={assessment.age}
              postcode={assessment.postcode}
              superBalance={assessment.superBalance}
              debtTypes={assessment.debtTypes}
              debtDetails={assessment.debtDetails}
              incomeSources={assessment.incomeSources}
              expenseItems={assessment.expenseItems}
              goals={assessment.goals}
              insurances={assessment.insurances}
            />
          </div>
        )}

        {showResults && (
          <div className="space-y-8">
            {assessment.goals.includes('Invest spare cash') && (
              <InvestmentGrowthCalculator defaultInvestmentAmount={totalMonthlySurplus} />
            )}
            {assessment.goals.includes('Buy a house') && (
              <HouseBuyingCalculator 
                assessmentData={assessment}
                totalMonthlyNetIncome={totalMonthlyNetIncome}
                totalAnnualGrossIncome={totalAnnualGrossIncome}
              />
            )}
            {assessment.goals.includes('Pay off debt') && (
              <DebtSnowballCalculator 
                debtDetails={assessment.debtDetails}
                totalMonthlySurplus={totalMonthlySurplus}
              />
            )}
            {assessment.goals.includes('Buy investment property') && (
              <InvestmentPropertyCalculator />
            )}
            {assessment.goals.includes('Set a budget') && (
              <BudgetPlanner 
                expenseItems={assessment.expenseItems}
                totalMonthlyNetIncome={totalMonthlyNetIncome}
              />
            )}
            {assessment.goals.includes('Learn about finance') && (
              <ActionItemsSection assessmentData={assessment} />
            )}
          </div>
        )}

        <FloatingActionButtons 
          isComplete={data.isComplete}
          user={user}
          aiSummary={data.aiSummary}
          hasDebtGoal={assessment.goals.includes('Pay off debt')}
          isGeneratingSummary={data.isGeneratingSummary}
          onExportToPDF={() => {}}
          onSaveResults={() => {}}
          onStartOver={data.handleStartOver}
          onChangeGoal={data.handleChangeGoal}
          onGenerateToughLove={() => data.generateSummary({ personality: 'tough' })}
        />
      </div>
    </div>
  );
}
