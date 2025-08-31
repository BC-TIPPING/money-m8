import LandingSection from "./index/LandingSection";
import AssessmentStepper from "./index/AssessmentStepper";
import AssessmentSummary from "./index/AssessmentSummary";
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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// New component imports
import FloatingActionButtons from "./index/components/FloatingActionButtons";
import SkipToSummaryButton from "./index/components/SkipToSummaryButton";
import GoalNavigationHeader from "./index/components/GoalNavigationHeader";
import EnhancedDebtCalculator from "./index/components/EnhancedDebtCalculator";
import InvestmentGrowthCalculator from "./index/InvestmentGrowthCalculator";
import PostDebtInvestmentVisualization from "./index/components/PostDebtInvestmentVisualization";
import PayOffHomeLoanCalculator from "./index/components/PayOffHomeLoanCalculator";
import EditAssessmentButton from "./index/components/EditAssessmentButton";
import BackToHealthCheckButton from "./index/components/BackToHealthCheckButton";
import { useSectionPDFExport } from "./index/hooks/useSectionPDFExport";

const DEBT_GOALS = ['Pay off home loan sooner', 'Reduce debt'];

export default function Index() {
  const assessment = useAssessmentState();
  const { user, signOut } = useAuth();
  const { handleExportToPDF } = useSectionPDFExport();

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
    
    // Scroll to top when starting assessment
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add goal selection event handler
  const handleGoalSelection = (goal: string) => {
    // Set this as the primary goal and show assessment/summary
    assessment.setGoals([goal]);
    
    // If we have completed assessment data, show the summary directly
    if (hasCompletedAssessment) {
      // Go to the summary step with this specific goal
      assessment.setStep(questions.length);
      assessment.setShowAssessment(true);
      generateSummary({});
    } else {
      // If no assessment data, start the assessment process
      assessment.setShowAssessment(true);
      assessment.setStep(0);
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
  
  // Clear cached results on browser refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear any cached assessment data
      localStorage.removeItem('selectedGoal');
      localStorage.removeItem('assessmentData');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

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

  // Only auto-generate summary when assessment is complete AND it's not Full Financial Health Check
  useEffect(() => {
    if (isComplete && !aiSummary && !isGeneratingSummary && !assessment.goals.includes('Full Financial Health Check')) {
      generateSummary({});
    }
  }, [isComplete, aiSummary, isGeneratingSummary, generateSummary, assessment.goals]);

  const handleStartOverWithReset = () => {
    handleStartOver();
  };

  const handleEditAssessment = () => {
    assessment.setStep(0);
  };

  const handleBackToHealthCheck = () => {
    // Return to Full Financial Health Check view
    assessment.setGoals(['Full Financial Health Check']);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasDebtGoal = assessment.goals.some(g => DEBT_GOALS.includes(g));
  
  // Determine when to show back to health check button
  const showBackToHealthCheck = isComplete && hasCompletedAssessment && !assessment.goals.includes('Full Financial Health Check');

  const totalMonthlyGrossIncome = calculateMonthlyAmount(assessment.incomeSources);
  const totalAnnualGrossIncome = totalMonthlyGrossIncome * 12;
  const annualTax = calculateAustralianIncomeTax(totalAnnualGrossIncome);
  const totalMonthlyNetIncome = totalAnnualGrossIncome > 0 ? (totalAnnualGrossIncome - annualTax) / 12 : 0;
  const totalMonthlyExpenses = calculateMonthlyAmount(assessment.expenseItems);
  const monthlySurplus = totalMonthlyNetIncome - totalMonthlyExpenses;

  return (
    <div className="relative min-h-screen">

      {!assessment.showAssessment ? (
        <LandingSection onStartAssessment={handleStartAssessment} isLoading={isLoadingAssessment} />
      ) : (
        <>
          <GoalNavigationHeader 
            currentGoals={assessment.goals}
            onBackToGoals={handleChangeGoal}
            showBackButton={assessment.showAssessment}
          />
          
          {isComplete && (
            <EditAssessmentButton onEdit={handleEditAssessment} />
          )}
          
          <div id="export-content" className={`flex-grow ${isComplete ? 'pb-52' : ''}`}>
            <div className="stepper-container" data-export-section="stepper">
              <AssessmentStepper
              {...assessment} 
              generateSummary={() => generateSummary({})}
              isGeneratingSummary={isGeneratingSummary}
              aiSummary={aiSummary}
              chartData={chartData}
              employmentStatus={assessment.employmentStatus || ""}
              setEmploymentStatus={assessment.setEmploymentStatus || (() => {})}
              financialKnowledgeLevel={assessment.financialKnowledgeLevel || ""}
              setFinancialKnowledgeLevel={assessment.setFinancialKnowledgeLevel || (() => {})}
              debtManagementConfidence={assessment.debtManagementConfidence || ""}
              setDebtManagementConfidence={assessment.setDebtManagementConfidence || (() => {})}
              freeTextComments={assessment.freeTextComments || ""}
              setFreeTextComments={assessment.setFreeTextComments || (() => {})}
              superFund={assessment.superFund || ""}
              setSuperFund={assessment.setSuperFund || (() => {})}
              mortgageRate={assessment.mortgageRate}
              setMortgageRate={assessment.setMortgageRate || (() => {})}
              assets={assessment.assets || []}
              setAssets={assessment.setAssets || (() => {})}
              isFinished={assessment.isFinished}
              setIsFinished={assessment.setIsFinished}
            />
            </div>
            
            {isComplete && (
              <>
                {assessment.goals.includes('Full Financial Health Check') && isComplete && assessment.step >= questions.length && assessment.isFinished && (
                  <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 health-check-section" data-export-section="health-check">
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
                      assets={assessment.assets || []}
                      generateSummary={generateSummary}
                      isGeneratingSummary={isGeneratingSummary}
                      aiSummary={aiSummary}
                    />
                    
                    {/* Thank You Assessment Summary after Full Financial Health Check */}
                    <div className="mt-8">
                      <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-white">
                        <CardHeader className="text-center">
                          <CardTitle className="text-2xl font-bold text-gray-900">Thank You!</CardTitle>
                          <p className="text-gray-600">Your financial assessment is complete. Here is a summary of your responses.</p>
                        </CardHeader>
                        <CardContent>
                          <AssessmentSummary 
                            employmentStatus={assessment.employmentStatus}
                            hasRegularIncome={assessment.hasRegularIncome}
                            incomeSources={assessment.incomeSources}
                            expenseItems={assessment.expenseItems}
                            uploadedFile={assessment.uploadedFile}
                            financialKnowledgeLevel={assessment.financialKnowledgeLevel}
                            investmentExperience={assessment.investmentExperience}
                            goals={assessment.goals}
                            otherGoal={assessment.otherGoal}
                            debtTypes={assessment.debtTypes}
                            debtDetails={assessment.debtDetails}
                            debtManagementConfidence={assessment.debtManagementConfidence}
                            freeTextComments={assessment.freeTextComments}
                          />
                        </CardContent>
                      </Card>
                    </div>

                  </div>
                )}
                
                {/* Other goal-specific components */}
                {!assessment.goals.includes('Full Financial Health Check') && (
          <div className="container mx-auto grid gap-6 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:px-8 goal-specific-section"
             style={{ paddingBottom: "120px" }} // Extra space for floating buttons
          >
                    {showBackToHealthCheck && (
                      <div className="lg:col-span-2">
                        <BackToHealthCheckButton 
                          onBackToHealthCheck={handleBackToHealthCheck}
                          showButton={showBackToHealthCheck}
                        />
                      </div>
                    )}
                    
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
                        <div data-export-section="budget-analysis">
                          <BudgetPlanner expenseItems={assessment.expenseItems} totalMonthlyNetIncome={totalMonthlyNetIncome} />
                        </div>
                    )}
                    {assessment.goals.includes('Reduce debt') && assessment.debtDetails && assessment.debtDetails.length > 0 && (
                        <div data-export-section="charts">
                          <EnhancedDebtCalculator 
                            debtDetails={assessment.debtDetails}
                            totalMonthlySurplus={monthlySurplus}
                          />
                          {/* Show debt reduction charts when chart data is available */}
                          {chartData?.debtReductionData && chartData.debtReductionData.length > 0 && (
                            <DebtReductionChart data={chartData.debtReductionData} />
                          )}
                          {chartData?.interestSavedData && chartData.interestSavedData.length > 0 && (
                            <InterestSavedChart data={chartData.interestSavedData} />
                          )}
                        </div>
                    )}
                    {assessment.goals.includes('Grow investments') && (
                        <div data-export-section="charts">
                          <InvestmentGrowthCalculator 
                            defaultInvestmentAmount={Math.max(monthlySurplus * 0.7, 100)}
                            currentAge={30}
                          />
                          <PostDebtInvestmentVisualization 
                            debtDetails={assessment.debtDetails}
                            monthlyIncome={totalMonthlyNetIncome}
                          />
                        </div>
                    )}
                    
                    
                    <div className="action-items-section" data-export-section="action-items">
                      <ActionItemsSection
                        assessmentData={assessment} 
                        onSetBudgetGoal={handleSetBudgetGoal}
                      />
                    </div>
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
            isComplete={isComplete}
            user={user}
            aiSummary={aiSummary}
            hasDebtGoal={hasDebtGoal}
            isGeneratingSummary={isGeneratingSummary}
            onExportToPDF={handleExportToPDF}
            onStartOver={handleStartOverWithReset}
            onChangeGoal={handleChangeGoal}
            onGenerateToughLove={() => generateSummary({ personality: 'dave_ramsey' })}
          />
        </>
      )}
      
      <footer className="w-full py-3 sm:py-2 px-2 sm:px-4 text-center bg-background border-t safe-area-padding">
        <p className="text-xs sm:text-xs text-muted-foreground italic leading-relaxed">
          Remember mate, this is just AI-generated guidance to get you thinking. It's not personal advice, so chat with a qualified professional before making any big money moves.
        </p>
      </footer>
    </div>
  );
}
