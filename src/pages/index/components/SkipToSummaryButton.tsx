
import React from 'react';
import { Button } from "@/components/ui/button";

interface SkipToSummaryButtonProps {
  isPreloaded: boolean;
  isComplete: boolean;
  questionsLength: number;
  onSkip: () => void;
}

const SkipToSummaryButton: React.FC<SkipToSummaryButtonProps> = ({
  isPreloaded,
  isComplete,
  questionsLength,
  onSkip
}) => {
  if (!isPreloaded || isComplete) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
      <Button 
        variant="secondary"
        className="shadow-lg"
        onClick={() => onSkip()}
      >
        Skip to My Summary
      </Button>
    </div>
  );
};

export default SkipToSummaryButton;
