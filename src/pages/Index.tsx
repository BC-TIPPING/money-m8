import LandingSection from "./index/LandingSection";
import AssessmentStepper from "./index/AssessmentStepper";
import { useAssessmentState, questions } from "./index/assessmentHooks";
import { useAssessmentData } from "./index/hooks/useAssessmentData";
import InterestSavedChart from "./index/InterestSavedChart";
import DebtReductionChart from "./index/DebtReductionChart";
import BudgetPlanner from "./index/budget-planner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { calculateMonthlyAmount, calculateAustralianIncomeTax } from "@/lib/financialCalculations";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import HouseBuyingCalculator from "./index/HouseBuyingCalculator";
import InvestmentPropertyCalculator from "./index/InvestmentPropertyCalculator";
import ActionItemsSection from "./index/ActionItemsSection";
import { Link } from "react-router-dom";
import FullFinancialHealthCheck from "./index/FullFinancialHealthCheck";
import { BarChart3 } from "lucide-react";

// New component imports
import SaveResultsModal from "./index/components/SaveResultsModal";
import FloatingActionButtons from "./index/components/FloatingActionButtons";
import SkipToSummaryButton from "./index/components/SkipToSummaryButton";
import GoalNavigationHeader from "./index/components/GoalNavigationHeader";
import DebtSnowballCalculator from "./index/DebtSnowballCalculator";
import InvestmentGrowthCalculator from "./index/InvestmentGrowthCalculator";
import PayOffHomeLoanCalculator from "./index/components/PayOffHomeLoanCalculator";
import EditAssessmentButton from "./index/components/EditAssessmentButton";
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
    shouldShowSummary,
    generateSummary,
    handleStartOver,
    handleChangeGoal,
    handleSetBudgetGoal,
    handleCompleteHealthCheck,
    hasCompletedAssessment,
  } = useAssessmentData(assessment);

  const {
    showSavePrompt,
    handleSaveResults,
    handleContinueAnonymous,
    resetDismissedFlag
  } = useSavePrompt({ isComplete, user });

  const handleStartAssessment = (goal: string) => {
    // Check if user has completed assessment before and redirect accordingly
    if (hasCompletedAssessment) {
      assessment.setGoals([goal]);
      assessment.setStep(questions.length); // Go directly to summary
      assessment.setShowAssessment(true);
      // Auto-generate summary with new goal
      setTimeout(() => generateSummary({}), 100);
    } else {
      // Allow anonymous users to start assessment immediately
      assessment.setGoals([goal]);
      assessment.setShowAssessment(true);
    }
  };

  // Add goal selection event handler
  const handleGoalSelection = (goal: string) => {
    if (!assessment.goals.includes(goal)) {
      const newGoals = [...assessment.goals, goal];
      assessment.setGoals(newGoals);
      
      // If we have assessment data, regenerate summary
      if (hasCompletedAssessment) {
        generateSummary({});
      }
    }
  };

  // Listen for goal selection events
  useEffect(() => {
    const handleGoalEvent = (event: CustomEvent) => {
      handleGoalSelection(event.detail);
    };

    window.addEventListener('selectGoal', handleGoalEvent as EventListener);
    return () => window.removeEventListener('selectGoal', handleGoalEvent as EventListener);
  }, [assessment.goals, hasCompletedAssessment, generateSummary]);
  
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

  // Auto-generate summary when assessment is complete
  useEffect(() => {
    if (shouldShowSummary && !aiSummary && !isGeneratingSummary) {
      generateSummary({});
    }
  }, [shouldShowSummary, aiSummary, isGeneratingSummary, generateSummary]);

  const handleStartOverWithReset = () => {
    resetDismissedFlag();
    handleStartOver();
  };

  const handleEditAssessment = () => {
    assessment.setStep(0);
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
          
          {shouldShowSummary && (
            <EditAssessmentButton onEdit={handleEditAssessment} />
          )}
          
          <div id="export-content" className={`flex-grow ${shouldShowSummary ? 'pb-52' : ''}`}>
            <AssessmentStepper 
              {...assessment} 
              generateSummary={() => generateSummary({})}
              isGeneratingSummary={isGeneratingSummary}
              aiSummary={aiSummary}
              chartData={chartData}
              onCompleteHealthCheck={handleCompleteHealthCheck}
            />
            
            {shouldShowSummary && (
              <>
                {assessment.goals.includes('Full Financial Health Check') && (
                  <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <FullFinancialHealthCheck 
                      age={assessment.age}
                      postcode={assessment.postcode}
                      superBalance={assessment.superBalance}
                      insurances={assessment.insurances}
                      debtTypes={assessment.debtTypes}
                      debtDetails={assessment.debtDetails}
                      incomeSources={assessment.incomeSources}
                      expenseItems={assessment.expenseItems}
                      goals={assessment.goals}
                    />
                    
                    {/* AI Summary positioned after Full Financial Health Check */}
                    {aiSummary && (
                      <div className="mt-8">
                        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <BarChart3 className="h-5 w-5 text-emerald-600" />
                              AI-Generated Financial Summary
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="prose prose-emerald max-w-none">
                              <div dangerouslySetInnerHTML={{ __html: aiSummary }} />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Other goal-specific components */}
                {!assessment.goals.includes('Full Financial Health Check') && (
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
                        <PayOffHomeLoanCalculator 
                          assessmentData={assessment}
                          totalMonthlyNetIncome={totalMonthlyNetIncome}
                          totalAnnualGrossIncome={totalAnnualGrossIncome}
                        />
                    )}
                    {assessment.goals.includes('Maximise super') && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Maximise Super 💰</CardTitle>
                                <CardDescription>Use our calculator to see how extra contributions can boost your retirement savings and lower your tax.</CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <Button asChild className="w-2/3">
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
                    
                    {/* AI Summary for other goals */}
                    {aiSummary && (
                      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
                        <CardHeader>
                          <CardTitle>AI-Generated Financial Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="prose prose-emerald max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: aiSummary }} />
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    <ActionItemsSection 
                      assessmentData={assessment} 
                      onSetBudgetGoal={handleSetBudgetGoal}
                    />
                  </div>
                )}
              </>
            )}
          </div>
          
          <SkipToSummaryButton 
            isPreloaded={isPreloaded}
            isComplete={isComplete}
            questionsLength={questions.length}
            onSkip={() => assessment.setStep(questions.length)}
          />
          
          <FloatingActionButtons 
            isComplete={shouldShowSummary}
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
      
      <footer className="w-full py-2 text-center bg-background border-t">
        <p className="text-xs text-muted-foreground italic">
          Remember mate, this is just AI-generated guidance to get you thinking. It's not personal advice, so chat with a qualified professional before making any big money moves.
        </p>
      </footer>
    </div>
  );
}
