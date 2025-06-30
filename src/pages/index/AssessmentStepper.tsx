
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { questions } from "./assessmentHooks";
import AssessmentSummary from "./AssessmentSummary";
import { ArrowLeft } from 'lucide-react';

interface AssessmentStepperProps {
  step: number;
  setStep: (step: number) => void;
  setShowAssessment: (show: boolean) => void;
  generateSummary: () => void;
  isGeneratingSummary: boolean;
  aiSummary: string | null;
  chartData: any;
  [key: string]: any;
}

const AssessmentStepper: React.FC<AssessmentStepperProps> = ({
  step,
  setStep,
  setShowAssessment,
  generateSummary,
  isGeneratingSummary,
  aiSummary,
  chartData,
  ...otherProps
}) => {
  const progress = ((step + 1) / questions.length) * 100;
  const isComplete = step >= questions.length;

  const handleBack = () => {
    if (step === 0) {
      // Go back to goal selection
      setShowAssessment(false);
    } else {
      setStep(step - 1);
    }
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    }
  };

  if (isComplete) {
    return (
      <AssessmentSummary 
        {...otherProps}
      />
    );
  }

  const currentQuestion = questions[step];

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-gray-500">
            Question {step + 1} of {questions.length}
          </h2>
          <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{currentQuestion.title}</CardTitle>
          {currentQuestion.subtitle && (
            <CardDescription>{currentQuestion.subtitle}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            {/* Question content will be rendered based on question type */}
            <p className="text-sm text-muted-foreground">Question type: {currentQuestion.type}</p>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {step === 0 ? 'Back to Goals' : 'Previous'}
            </Button>
            
            <Button onClick={handleNext}>
              {step === questions.length - 1 ? 'Complete Assessment' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentStepper;
