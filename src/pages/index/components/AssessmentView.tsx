
import React from 'react';
import AssessmentStepper from "../AssessmentStepper";
import CompletedAssessmentView from "./CompletedAssessmentView";

interface AssessmentViewProps {
  assessment: any;
  generateSummary: () => void;
  isGeneratingSummary: boolean;
  aiSummary: string | null;
  chartData: any;
  isComplete: boolean;
}

const AssessmentView: React.FC<AssessmentViewProps> = ({
  assessment,
  generateSummary,
  isGeneratingSummary,
  aiSummary,
  chartData,
  isComplete
}) => {
  return (
    <>
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
        />
      )}
    </>
  );
};

export default AssessmentView;
