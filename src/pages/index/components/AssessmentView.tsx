
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft } from 'lucide-react';
import AssessmentStepper from "../AssessmentStepper";
import CompletedAssessmentView from "./CompletedAssessmentView";

interface AssessmentViewProps {
  assessment: any;
  generateSummary: () => void;
  isGeneratingSummary: boolean;
  aiSummary: string | null;
  chartData: any;
  isComplete: boolean;
  onBackToGoals: () => void;
}

const AssessmentView: React.FC<AssessmentViewProps> = ({
  assessment,
  generateSummary,
  isGeneratingSummary,
  aiSummary,
  chartData,
  isComplete,
  onBackToGoals
}) => {
  return (
    <>
      {assessment.step === 0 && (
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={onBackToGoals}
            className="mb-4"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Goals
          </Button>
        </div>
      )}
      
      <AssessmentStepper 
        {...assessment} 
        generateSummary={() => generateSummary()}
        isGeneratingSummary={isGeneratingSummary}
        aiSummary={aiSummary}
        chartData={chartData}
      />
      {isComplete && (
        <CompletedAssessmentView 
          assessment={assessment}
          chartData={chartData}
          aiSummary={aiSummary}
          generateSummary={generateSummary}
          isGeneratingSummary={isGeneratingSummary}
        />
      )}
    </>
  );
};

export default AssessmentView;
