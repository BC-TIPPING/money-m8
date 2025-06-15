
import LandingSection from "./index/LandingSection";
import AssessmentStepper from "./index/AssessmentStepper";
import { useAssessmentState, questions } from "./index/assessmentHooks";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAssessmentData } from "./index/hooks/useAssessmentData";
import InterestSavedChart from "./index/InterestSavedChart";
import DebtReductionChart from "./index/DebtReductionChart";
import BudgetPlanner from "./index/budget-planner";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateMonthlyAmount, calculateAustralianIncomeTax } from "@/lib/financialCalculations";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const DEBT_GOALS = ['Pay off home loan sooner', 'Reduce debt'];

export default function Index() {
  const assessment = useAssessmentState();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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
  } = useAssessmentData(assessment);

  const handleStartAssessment = (goal: string) => {
    if (!user) {
      localStorage.setItem('selectedGoal', goal);
      navigate('/auth');
      return;
    }
    assessment.setGoals([goal]);
    assessment.setShowAssessment(true);
  };
  
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

  const hasDebtGoal = assessment.goals.some(g => DEBT_GOALS.includes(g));

  const totalMonthlyGrossIncome = calculateMonthlyAmount(assessment.incomeSources);
  const totalAnnualGrossIncome = totalMonthlyGrossIncome * 12;
  const annualTax = calculateAustralianIncomeTax(totalAnnualGrossIncome);
  const totalMonthlyNetIncome = totalAnnualGrossIncome > 0 ? (totalAnnualGrossIncome - annualTax) / 12 : 0;

  if (!assessment.showAssessment) {
    return (
      <div className="relative min-h-screen">
        <LandingSection onStartAssessment={handleStartAssessment} isLoading={isLoadingAssessment} />
        <div className="absolute bottom-4 right-4 flex gap-2">
            {user ? (
              <Button onClick={signOut} variant="outline">Sign Out</Button>
            ) : (
              <Button asChild variant="outline">
                  <Link to="/auth">Login</Link>
              </Button>
            )}
            <Button asChild variant="outline">
                <Link to="/ask-ai">Ask our AI</Link>
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen">
        <div className={`flex-grow ${isComplete ? 'pb-52' : ''}`}>
            <AssessmentStepper 
              {...assessment} 
              generateSummary={() => generateSummary({})}
              isGeneratingSummary={isGeneratingSummary}
              aiSummary={aiSummary}
              chartData={chartData}
            />
            {isComplete && (
                <div className="container mx-auto grid gap-6 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:px-8">
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
                </div>
            )}
        </div>
        {isPreloaded && !isComplete && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
                <Button 
                    variant="secondary"
                    className="shadow-lg"
                    onClick={() => assessment.setStep(questions.length)}
                >
                    Skip to My Summary
                </Button>
            </div>
        )}
        {isComplete && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm px-4">
                <div className="flex flex-col items-center gap-4">
                    {aiSummary && (
                        <Button 
                            onClick={handleStartOver}
                            variant="outline"
                            className="shadow-lg bg-background w-full"
                        >
                            Start Over
                        </Button>
                    )}
                    <Button
                        onClick={handleChangeGoal}
                        variant="outline"
                        className="shadow-lg bg-background w-full"
                    >
                        Change Goal
                    </Button>
                    {!aiSummary && hasDebtGoal && (
                        <Button 
                            onClick={() => generateSummary({ personality: 'dave_ramsey' })}
                            variant="destructive"
                            className="shadow-lg w-full"
                            disabled={isGeneratingSummary}
                        >
                            {isGeneratingSummary ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Getting tough...
                                </>
                            ) : "Tough Love"}
                        </Button>
                    )}
                </div>
            </div>
        )}
    </div>
  );
}
