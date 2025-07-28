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
import { usePDFExport } from "./index/hooks/usePDFExport";

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
    // Set this as the primary goal and show assessment/summary
    assessment.setGoals([goal]);
    
    // If we have completed assessment data, show the summary directly
    if (hasCompletedAssessment) {
      // Go to the summary step with this specific goal
      assessment.setStep(questions.length);
      assessment.setShowAssessment(true);
      // For Full Financial Health Check, auto-generate summary
      if (goal === 'Full Financial Health Check') {
        setTimeout(() => generateSummary({}), 100);
      } else {
        generateSummary({});
      }
    } else {
      // If no assessment data, start the assessment process
      assessment.setShowAssessment(true);
      assessment.setStep(0);
    }
  };

  // Listen for goal selection events and edit assessment events
  useEffect(() => {
    const handleGoalEvent = (event: CustomEvent) => {
      handleGoalSelection(event.detail);
    };

    const handleEditEvent = () => {
      console.log('Edit event received, current step:', assessment.step);
      // Take users to the last step before summary so they can review/edit
      assessment.setStep(questions.length - 1);
      console.log('Step set to:', questions.length - 1);
    };

    window.addEventListener('selectGoal', handleGoalEvent as EventListener);
    window.addEventListener('editAssessment', handleEditEvent as EventListener);
    return () => {
      window.removeEventListener('selectGoal', handleGoalEvent as EventListener);
      window.removeEventListener('editAssessment', handleEditEvent as EventListener);
    };
  }, [assessment.goals, hasCompletedAssessment, generateSummary]);
  
  // Store goal selection in localStorage for persistence across navigation
  useEffect(() => {
    if (user) {
      const goal = localStorage.getItem('selectedGoal');
      if (goal && hasCompletedAssessment) {
        // Only auto-select goal if we have assessment data
        assessment.setGoals([goal]);
        assessment.setStep(questions.length);
        assessment.setShowAssessment(true);
        if (goal === 'Full Financial Health Check') {
          setTimeout(() => generateSummary({}), 100);
        } else {
          generateSummary({});
        }
        localStorage.removeItem('selectedGoal');
      }
    }
  }, [user, hasCompletedAssessment, generateSummary]);

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

  const hasDebtGoal = assessment.goals.some(g => DEBT_GOALS.includes(g));

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
            {!assessment.goals.includes('Full Financial Health Check') && (
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
              />
            )}
            
            {/* Full Financial Health Check - show directly without assessment stepper */}
            {assessment.goals.includes('Full Financial Health Check') && (
              <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
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
                />
                
                {/* Thank You Assessment Summary after Full Financial Health Check */}
                <div className="mt-8">
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
                </div>

                {/* AI Summary positioned after Assessment Summary */}
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
                        <div className="prose prose-emerald max-w-none prose-headings:text-emerald-800 prose-strong:text-emerald-700">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {aiSummary}
                          </ReactMarkdown>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
            
            {isComplete && !assessment.goals.includes('Full Financial Health Check') && (
              <>
                {/* Edit Survey Button for other goals */}
                <div className="container mx-auto px-4 py-2 sm:px-6 lg:px-8 text-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      console.log('Direct edit button clicked');
                      assessment.setStep(questions.length - 1);
                      console.log('Step set to:', questions.length - 1);
                    }}
                    className="mb-4"
                  >
                    Edit Survey
                  </Button>
                </div>
                
                {/* Other goal-specific components */}
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
                        <EnhancedDebtCalculator 
                          debtDetails={assessment.debtDetails}
                          totalMonthlySurplus={monthlySurplus}
                        />
                    )}
                    {assessment.goals.includes('Grow investments') && (
                        <>
                          <InvestmentGrowthCalculator 
                            defaultInvestmentAmount={Math.max(monthlySurplus * 0.7, 100)}
                            currentAge={30}
                          />
                          <PostDebtInvestmentVisualization 
                            debtDetails={assessment.debtDetails}
                            monthlyIncome={totalMonthlyNetIncome}
                          />
                        </>
                    )}
                    {chartData?.debtReductionData && <DebtReductionChart data={chartData.debtReductionData} />}
                    {chartData?.interestSavedData && <InterestSavedChart data={chartData.interestSavedData} />}
                    
                    
                    <ActionItemsSection 
                      assessmentData={assessment} 
                      onSetBudgetGoal={handleSetBudgetGoal}
                    />
                  </div>
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
      
      <footer className="w-full py-2 text-center bg-background border-t">
        <p className="text-xs text-muted-foreground italic">
          Remember mate, this is just AI-generated guidance to get you thinking. It's not personal advice, so chat with a qualified professional before making any big money moves.
        </p>
      </footer>
    </div>
  );
}
