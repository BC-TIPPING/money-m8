
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAssessmentState, questions } from "../assessmentHooks";
import { useAssessmentData } from "./useAssessmentData";
import { usePDFExport } from "./usePDFExport";
import { useSavePrompt } from "./useSavePrompt";

export const useIndexLogic = () => {
  const assessment = useAssessmentState();
  const { user } = useAuth();
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
  } = useAssessmentData(assessment);

  const {
    showSavePrompt,
    handleSaveResults,
    handleContinueAnonymous,
    resetDismissedFlag
  } = useSavePrompt({ isComplete, user });

  const handleStartAssessment = (goal: string) => {
    // Goals that have calculators - skip assessment and go directly to calculator
    const calculatorGoals = ['Buy a house', 'Buy an investment property'];
    
    if (calculatorGoals.includes(goal)) {
      assessment.setGoals([goal]);
      assessment.setShowAssessment(true);
      assessment.setStep(questions.length); // Skip to the end to show calculator
      assessment.setComplete(true);
    } else {
      // Regular flow for other goals
      assessment.setGoals([goal]);
      assessment.setShowAssessment(true);
    }
  };

  const handleFullAnalysis = () => {
    // Reset assessment and start from beginning
    assessment.setStep(0);
    assessment.setComplete(false);
  };

  const handleBackToGoals = () => {
    // Reset to goal selection
    assessment.setShowAssessment(false);
    assessment.setGoals([]);
    assessment.setStep(0);
    assessment.setComplete(false);
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

  // Check if we're showing calculator-only mode
  const isCalculatorOnlyMode = isComplete && 
    (assessment.goals.includes('Buy a house') || assessment.goals.includes('Buy an investment property')) && 
    assessment.step === questions.length && 
    !assessment.answers.length;

  return {
    assessment,
    user,
    aiSummary,
    chartData,
    isPreloaded,
    isLoadingAssessment,
    isGeneratingSummary,
    isComplete,
    generateSummary,
    handleStartOver,
    handleChangeGoal,
    showSavePrompt,
    handleSaveResults,
    handleContinueAnonymous,
    handleStartAssessment,
    handleFullAnalysis,
    handleStartOverWithReset,
    handleExportToPDF,
    isCalculatorOnlyMode,
    handleBackToGoals,
  };
};
