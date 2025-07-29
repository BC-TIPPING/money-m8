
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
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20">
      <Button 
        variant="secondary"
        className="shadow-lg text-xs sm:text-sm px-3 sm:px-4"
        size="sm"
        onClick={() => onSkip()}
      >
        <span className="hidden sm:inline">Skip to My Summary</span>
        <span className="sm:hidden">Skip to Summary</span>
      </Button>
    </div>
  );
};

export default SkipToSummaryButton;
