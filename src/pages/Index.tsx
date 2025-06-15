
import { useState } from "react";
import { Button } from "@/components/ui/button";
import AssessmentStepper from "./index/AssessmentStepper";
import { useAssessmentState } from "./index/assessmentHooks";
import { useAssessmentApi } from "./index/hooks/useAssessmentApi";
import { PRELOADED_EXPENSE_CATEGORIES } from "@/lib/budgetCategories";
import ResultsDisplay from "./index/ResultsDisplay";
import LandingSection from "./index/LandingSection";
import FileAnalysisReport from "./index/FileAnalysisReport";

export type AssessmentData = ReturnType<typeof useAssessmentState>;

export default function IndexPage() {
  const assessmentState = useAssessmentState();
  const { showAssessment, setShowAssessment, setUsername, setGoals } = assessmentState;

  const { isGenerating, assessmentResult, error, generateFinancialSummary, setAssessmentResult } = useAssessmentApi();
  const [personality, setPersonality] = useState('default');
  const [analysisReport, setAnalysisReport] = useState<any>(null);


  const handleSubmit = () => {
    const dataToSubmit = { ...assessmentState };
    // Let's remove things we don't want to send to the backend
    delete (dataToSubmit as any).setStep;
    delete (dataToSubmit as any).setShowAssessment;
    // ... and so on for all state setters
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setStep,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setShowAssessment,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setGoals,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setUsername,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setOtherGoal,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setGoalTimeframe,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setDebtTypes,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setDebtDetails,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setDebtManagementConfidence,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setFreeTextComments,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setFinancialKnowledgeLevel,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setInvestmentExperience,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setEmploymentStatus,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setHasRegularIncome,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setIncomeSources,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setExpenseItems,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setUploadedFile,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      fileInputRef,
      ...data
    } = assessmentState;


    generateFinancialSummary(data, personality);
    setShowAssessment(false);
  };

  const handleStartOver = () => {
    // Reset all state to initial values
    assessmentState.setStep(0);
    assessmentState.setGoals([]);
    assessmentState.setOtherGoal('');
    assessmentState.setGoalTimeframe(undefined);
    assessmentState.setDebtTypes([]);
    assessmentState.setDebtDetails([]);
    assessmentState.setDebtManagementConfidence(undefined);
    assessmentState.setFreeTextComments('');
    assessmentState.setFinancialKnowledgeLevel(undefined);
    assessmentState.setInvestmentExperience([]);
    assessmentState.setEmploymentStatus(undefined);
    assessmentState.setHasRegularIncome(undefined);
    assessmentState.setIncomeSources([{ category: '', amount: '', frequency: 'Monthly' }]);
    assessmentState.setExpenseItems(PRELOADED_EXPENSE_CATEGORIES.map(c => ({ category: c, amount: '', frequency: 'Weekly' })));
    assessmentState.setUploadedFile(null);
    setAssessmentResult(null);
    setAnalysisReport(null);
    setShowAssessment(false);
  };

  const handleStartAssessment = (goal: string, username: string) => {
    setGoals([goal]);
    setUsername(username);
    setShowAssessment(true);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        {!showAssessment && !assessmentResult && !isGenerating && !analysisReport && (
          <LandingSection onStartAssessment={handleStartAssessment} isLoading={isGenerating} />
        )}

        {(showAssessment || (assessmentResult && !isGenerating) || analysisReport) && (
            <div className="flex justify-end">
                <Button variant="ghost" onClick={handleStartOver}>Start Over</Button>
            </div>
        )}

        {showAssessment && !assessmentResult && (
          <AssessmentStepper 
            {...assessmentState}
            onSubmit={handleSubmit}
            personality={personality}
            setPersonality={setPersonality}
            setAnalysisReport={(report) => {
              setAnalysisReport(report);
              setShowAssessment(false);
            }}
            isGeneratingSummary={isGenerating}
            aiSummary={assessmentResult?.summary ?? null}
            chartData={assessmentResult?.chartData ?? null}
          />
        )}

        {isGenerating && (
          <div className="text-center p-8">
            <p className="text-lg animate-pulse">Brewing your personalised financial plan... 一杯どうぞ</p>
          </div>
        )}

        {error && <div className="text-red-500 text-center p-4">{error}</div>}

        {analysisReport && !assessmentResult && (
          <div>
            <FileAnalysisReport result={analysisReport} />
            <div className="mt-8 text-center space-x-4">
              <Button onClick={() => {
                if (analysisReport.income_sources) {
                  assessmentState.setIncomeSources(analysisReport.income_sources);
                }
                if (analysisReport.expense_items) {
                  assessmentState.setExpenseItems(analysisReport.expense_items);
                }
                handleSubmit();
                setAnalysisReport(null);
              }}>Accept & Proceed</Button>
              <Button variant="outline" onClick={() => {
                setAnalysisReport(null);
                setShowAssessment(true);
              }}>Reconfigure Manually</Button>
            </div>
          </div>
        )}

        {assessmentResult && !isGenerating && (
          <ResultsDisplay summary={assessmentResult.summary} chartData={assessmentResult.chartData} />
        )}
      </div>
    </div>
  );
}
