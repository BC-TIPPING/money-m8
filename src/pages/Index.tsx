
import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { questions } from "./index/assessmentHooks";
import { useIndexLogic } from "./index/hooks/useIndexLogic";

// Component imports
import LandingSection from "./index/LandingSection";
import AssessmentView from "./index/components/AssessmentView";
import CalculatorOnlyView from "./index/components/CalculatorOnlyView";
import SaveResultsModal from "./index/components/SaveResultsModal";
import FloatingActionButtons from "./index/components/FloatingActionButtons";
import SkipToSummaryButton from "./index/components/SkipToSummaryButton";
import HeaderButtons from "./index/components/HeaderButtons";

const DEBT_GOALS = ['Pay off home loan sooner', 'Reduce debt'];

export default function Index() {
  const { signOut } = useAuth();
  const {
    assessment,
    user,
    aiSummary,
    chartData,
    isPreloaded,
    isLoadingAssessment,
    isGeneratingSummary,
    isComplete,
    generateSummary,
    handleChangeGoal,
    showSavePrompt,
    handleSaveResults,
    handleContinueAnonymous,
    handleStartAssessment,
    handleFullAnalysis,
    handleStartOverWithReset,
    handleExportToPDF,
    isCalculatorOnlyMode,
  } = useIndexLogic();

  const hasDebtGoal = assessment.goals.some(g => DEBT_GOALS.includes(g));

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
          <div id="export-content" className={`flex-grow ${isComplete ? 'pb-52' : ''}`}>
            {/* Show calculator-only mode or full assessment */}
            {isCalculatorOnlyMode ? (
              <CalculatorOnlyView 
                assessment={assessment}
                onFullAnalysis={handleFullAnalysis}
              />
            ) : (
              <AssessmentView 
                assessment={assessment}
                generateSummary={generateSummary}
                isGeneratingSummary={isGeneratingSummary}
                aiSummary={aiSummary}
                chartData={chartData}
                isComplete={isComplete}
              />
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
