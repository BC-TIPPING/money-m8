
import LandingSection from "./index/LandingSection";
import AssessmentStepper from "./index/AssessmentStepper";
import { useAssessmentState, questions } from "./index/assessmentHooks";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAssessmentData } from "./index/hooks/useAssessmentData";

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
        <div className="flex-grow">
            <AssessmentStepper 
              {...assessment} 
              generateSummary={() => generateSummary({})}
              isGeneratingSummary={isGeneratingSummary}
              aiSummary={aiSummary}
              chartData={chartData}
            />
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
            <footer className="w-full p-6 bg-secondary">
                <div className="flex gap-4 justify-center">
                    {!aiSummary && (
                        <Button 
                            onClick={() => generateSummary({ personality: 'dave_ramsey' })}
                            variant="destructive"
                            className="shadow-lg"
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
                    {aiSummary && (
                        <Button 
                            onClick={handleStartOver}
                            variant="outline"
                            className="shadow-lg bg-background"
                        >
                            Start Over
                        </Button>
                    )}
                </div>
            </footer>
        )}
    </div>
  );
}
