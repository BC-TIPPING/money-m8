
import LandingSection from "./index/LandingSection";
import AssessmentStepper from "./index/AssessmentStepper";
import { useAssessmentState, questions } from "./index/assessmentHooks";
import { useAssessmentData } from "./index/hooks/useAssessmentData";
import InterestSavedChart from "./index/InterestSavedChart";
import DebtReductionChart from "./index/DebtReductionChart";
import BudgetPlanner from "./index/budget-planner";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { calculateMonthlyAmount, calculateAustralianIncomeTax } from "@/lib/financialCalculations";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import HouseBuyingCalculator from "./index/HouseBuyingCalculator";
import ActionItemsSection from "./index/ActionItemsSection";
import { Link } from "react-router-dom";

// New component imports
import SaveResultsModal from "./index/components/SaveResultsModal";
import FloatingActionButtons from "./index/components/FloatingActionButtons";
import SkipToSummaryButton from "./index/components/SkipToSummaryButton";
import HeaderButtons from "./index/components/HeaderButtons";
import GoalNavigationHeader from "./index/components/GoalNavigationHeader";
import DebtSnowballCalculator from "./index/DebtSnowballCalculator";
import InvestmentGrowthCalculator from "./index/InvestmentGrowthCalculator";
import { usePDFExport } from "./index/hooks/usePDFExport";
import { useSavePrompt } from "./index/hooks/useSavePrompt";

const DEBT_GOALS = ['Pay off home loan sooner', 'Reduce debt'];

export default function Index() {
  const assessment = useAssessmentState();
  const { user, signOut } = useAuth();
  const { handleExportToPDF } = usePDFExport();

  const {
    aiSummary,
    chartData,
    isPreloaded,
    isLoadingAssessment,
    isGeneratingSummary,
    isComplete,
    generateSummary,
    handleStartOver,
    handleChangeGoal,
    handleSetBudgetGoal,
    hasCompletedAssessment,
  } = useAssessmentData(assessment);

  const {
    showSavePrompt,
    handleSaveResults,
    handleContinueAnonymous,
    resetDismissedFlag
  } = useSavePrompt({ isComplete, user });

  const handleStartAssessment = (goal: string) => {
    // Allow anonymous users to start assessment immediately
    assessment.setGoals([goal]);
    assessment.setShowAssessment(true);
  };
  
  // Remove the localStorage goal handling since we're allowing anonymous access
  useEffect(() => {
    if (user) {
      const goal = localStorage.getItem('selectedGoal');
      if (goal) {
        assessment.setGoals([goal]);
        assessment.setShowAssessment(true);
        localStorage.removeItem('selectedGoal');
      }
    }
  }, [user, assessment]);

  const handleStartOverWithReset = () => {
    resetDismissedFlag();
    handleStartOver();
  };

  const hasDebtGoal = assessment.goals.some(g => DEBT_GOALS.includes(g));

  const totalMonthlyGrossIncome = calculateMonthlyAmount(assessment.incomeSources);
  const totalAnnualGrossIncome = totalMonthlyGrossIncome * 12;
  const annualTax = calculateAustralianIncomeTax(totalAnnualGrossIncome);
  const totalMonthlyNetIncome = totalAnnualGrossIncome > 0 ? (totalAnnualGrossIncome - annualTax) / 12 : 0;
  const totalMonthlyExpenses = calculateMonthlyAmount(assessment.expenseItems);
  const monthlySurplus = totalMonthlyNetIncome - totalMonthlyExpenses;

  return (
    <div className="relative min-h-screen">
      <HeaderButtons user={user} onSignOut={signOut} />

      <SaveResultsModal 
        showSavePrompt={showSavePrompt}
        onSaveResults={handleSaveResults}
        onContinueAnonymous={handleContinueAnonymous}
      />

      {!assessment.showAssessment ? (
        <LandingSection onStartAssessment={handleStartAssessment} isLoading={isLoadingAssessment} />
      ) : (
        <>
          <GoalNavigationHeader 
            currentGoals={assessment.goals}
            onBackToGoals={handleChangeGoal}
            showBackButton={assessment.showAssessment}
          />
          
          <div id="export-content" className={`flex-grow ${isComplete ? 'pb-52' : ''}`}>
            <AssessmentStepper 
              {...assessment} 
              generateSummary={() => generateSummary({})}
              isGeneratingSummary={isGeneratingSummary}
              aiSummary={aiSummary}
              chartData={chartData}
            />
            {isComplete && (
                <div className="container mx-auto grid gap-6 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:px-8">
                    {assessment.goals.includes('Buy a house') && (
                        <HouseBuyingCalculator 
                          assessmentData={assessment}
                          totalMonthlyNetIncome={totalMonthlyNetIncome}
                          totalAnnualGrossIncome={totalAnnualGrossIncome}
                        />
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
                    {assessment.goals.includes('Reduce debt') && assessment.debtDetails && assessment.debtDetails.length > 0 && (
                        <DebtSnowballCalculator 
                          debtDetails={assessment.debtDetails}
                          totalMonthlySurplus={monthlySurplus}
                        />
                    )}
                    {assessment.goals.includes('Grow investments') && (
                        <InvestmentGrowthCalculator 
                          defaultInvestmentAmount={Math.max(monthlySurplus * 0.7, 100)}
                          currentAge={30}
                        />
                    )}
                    {chartData?.debtReductionData && <DebtReductionChart data={chartData.debtReductionData} />}
                    {chartData?.interestSavedData && <InterestSavedChart data={chartData.interestSavedData} />}
                    <ActionItemsSection 
                      assessmentData={assessment} 
                      onSetBudgetGoal={handleSetBudgetGoal}
                    />
                </div>
            )}
          </div>
          
          <SkipToSummaryButton 
            isPreloaded={isPreloaded}
            isComplete={isComplete}
            questionsLength={questions.length}
            onSkip={() => assessment.setStep(questions.length)}
          />
          
          <FloatingActionButtons 
            isComplete={isComplete}
            user={user}
            aiSummary={aiSummary}
            hasDebtGoal={hasDebtGoal}
            isGeneratingSummary={isGeneratingSummary}
            onExportToPDF={handleExportToPDF}
            onSaveResults={handleSaveResults}
            onStartOver={handleStartOverWithReset}
            onChangeGoal={handleChangeGoal}
            onGenerateToughLove={() => generateSummary({ personality: 'dave_ramsey' })}
          />
        </>
      )}
    </div>
  );
}
