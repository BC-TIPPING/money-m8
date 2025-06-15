import LandingSection from "./index/LandingSection";
import AssessmentStepper from "./index/AssessmentStepper";
import { useAssessmentState, questions } from "./index/assessmentHooks";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAssessmentData } from "./index/hooks/useAssessmentData";
import InterestSavedChart from "./index/InterestSavedChart";

export default function Index() {
  const assessment = useAssessmentState();
  const {
    aiSummary,
    chartData,
    isPreloaded,
    isLoadingAssessment,
    isGeneratingSummary,
    isComplete,
    setUsernameToFetch,
    generateSummary,
    handleStartOver,
    handleChangeGoal,
  } = useAssessmentData(assessment);

  const handleStartAssessment = (goal: string, newUsername: string) => {
    assessment.setGoals([goal]);
    setUsernameToFetch(newUsername);
  };
  
  if (!assessment.showAssessment) {
    return (
      <div className="relative min-h-screen">
        <LandingSection onStartAssessment={handleStartAssessment} isLoading={isLoadingAssessment} />
        <div className="absolute bottom-4 right-4">
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
            {isComplete && chartData?.interestSavedData && (
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <InterestSavedChart data={chartData.interestSavedData} />
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
                    {!aiSummary && (
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
