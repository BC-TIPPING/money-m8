import LandingSection from "./index/LandingSection";
import AssessmentStepper from "./index/AssessmentStepper";
import { useAssessmentState, questions } from "./index/assessmentHooks";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn, LogOut, FileText, Save } from "lucide-react";
import { useAssessmentData } from "./index/hooks/useAssessmentData";
import InterestSavedChart from "./index/InterestSavedChart";
import DebtReductionChart from "./index/DebtReductionChart";
import BudgetPlanner from "./index/budget-planner";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateMonthlyAmount, calculateAustralianIncomeTax } from "@/lib/financialCalculations";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import HouseBuyingCalculator from "./index/HouseBuyingCalculator";
import ActionItemsSection from "./index/ActionItemsSection";

const DEBT_GOALS = ['Pay off home loan sooner', 'Reduce debt'];

export default function Index() {
  const assessment = useAssessmentState();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showSavePrompt, setShowSavePrompt] = useState(false);

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

  // Show save prompt when assessment is complete and user is not logged in
  useEffect(() => {
    if (isComplete && !user && !showSavePrompt) {
      setShowSavePrompt(true);
    }
  }, [isComplete, user, showSavePrompt]);

  const handleExportToPDF = () => {
    const input = document.getElementById('export-content');
    if (!input) {
      console.error("The element to export was not found.");
      return;
    };

    const originalBackgroundColor = input.style.backgroundColor;
    input.style.backgroundColor = 'white';

    html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
      input.style.backgroundColor = originalBackgroundColor;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      const ratio = canvasWidth / canvasHeight;
      const imgHeightOnPdf = pdfWidth / ratio;
      
      let heightLeft = imgHeightOnPdf;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightOnPdf);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = -heightLeft;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightOnPdf);
        heightLeft -= pdfHeight;
      }
      pdf.save('financial-assessment.pdf');
    });
  };

  const handleSaveResults = () => {
    navigate('/auth');
  };

  const handleContinueAnonymous = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Continue anonymous clicked');
    setShowSavePrompt(false);
  };

  const hasDebtGoal = assessment.goals.some(g => DEBT_GOALS.includes(g));

  const totalMonthlyGrossIncome = calculateMonthlyAmount(assessment.incomeSources);
  const totalAnnualGrossIncome = totalMonthlyGrossIncome * 12;
  const annualTax = calculateAustralianIncomeTax(totalAnnualGrossIncome);
  const totalMonthlyNetIncome = totalAnnualGrossIncome > 0 ? (totalAnnualGrossIncome - annualTax) / 12 : 0;

  return (
    <div className="relative min-h-screen">
      <div className="absolute top-4 right-4 flex gap-2 z-50">
        {user ? (
          <Button onClick={signOut} variant="outline" className="bg-background/80 backdrop-blur-sm">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        ) : (
          <Button asChild variant="outline" className="bg-background/80 backdrop-blur-sm">
            <Link to="/auth">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Link>
          </Button>
        )}
        <Button asChild variant="outline" className="bg-background/80 backdrop-blur-sm">
          <Link to="/ask-ai">Ask our AI</Link>
        </Button>
      </div>

      {/* Save Results Prompt for Anonymous Users */}
      {showSavePrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <Card className="w-full max-w-md relative z-[101]">
            <CardHeader>
              <CardTitle>Save Your Results?</CardTitle>
              <CardDescription>
                Your assessment is complete! Would you like to create an account to save your results and access them later?
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col gap-2">
              <Button onClick={handleSaveResults} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Results (Create Account)
              </Button>
              <Button 
                type="button"
                onClick={handleContinueAnonymous} 
                variant="outline" 
                className="w-full"
              >
                Continue Without Saving
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {!assessment.showAssessment ? (
        <LandingSection onStartAssessment={handleStartAssessment} isLoading={isLoadingAssessment} />
      ) : (
        <>
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
                    {chartData?.debtReductionData && <DebtReductionChart data={chartData.debtReductionData} />}
                    {chartData?.interestSavedData && <InterestSavedChart data={chartData.interestSavedData} />}
                    <ActionItemsSection assessmentData={assessment} />
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
                      <Button onClick={handleExportToPDF} variant="outline" className="shadow-lg bg-background w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        Export to PDF
                      </Button>
                      {!user && (
                          <Button 
                              onClick={handleSaveResults}
                              className="shadow-lg w-full"
                          >
                              <Save className="mr-2 h-4 w-4" />
                              Save Results
                          </Button>
                      )}
                      <Button
                          onClick={handleStartOver}
                          variant="outline"
                          className="shadow-lg bg-background w-full"
                      >
                          Start Over
                      </Button>
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
        </>
      )}
    </div>
  );
}
