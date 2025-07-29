
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Loader2, FileText, Target, RotateCcw } from 'lucide-react';

interface FloatingActionButtonsProps {
  isComplete: boolean;
  user: any;
  aiSummary: string | null;
  hasDebtGoal: boolean;
  isGeneratingSummary: boolean;
  onExportToPDF: () => void;
  onStartOver: () => void;
  onChangeGoal: () => void;
  onGenerateToughLove: () => void;
}

const FloatingActionButtons: React.FC<FloatingActionButtonsProps> = ({
  isComplete,
  user,
  aiSummary,
  hasDebtGoal,
  isGeneratingSummary,
  onExportToPDF,
  onStartOver,
  onChangeGoal,
  onGenerateToughLove,
}) => {
  if (!isComplete) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-xs sm:max-w-sm px-2 sm:px-4">
      <div className="flex flex-col items-center gap-2 sm:gap-3">
        <div className="flex gap-1 sm:gap-2 w-full">
          <Button
            onClick={onChangeGoal}
            variant="outline"
            className="shadow-lg bg-background flex-1 text-xs sm:text-sm px-2 sm:px-3 py-2"
            size="sm"
          >
            <Target className="mr-1 h-3 w-3" />
            <span className="hidden sm:inline">Change Goal</span>
            <span className="sm:hidden">Change</span>
          </Button>
          <Button
            onClick={onStartOver}
            variant="outline"
            className="shadow-lg bg-background flex-1 text-xs sm:text-sm px-2 sm:px-3 py-2"
            size="sm"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            <span className="hidden sm:inline">Start Over</span>
            <span className="sm:hidden">Restart</span>
          </Button>
        </div>
        
        <Button 
          onClick={onExportToPDF} 
          variant="outline" 
          className="shadow-lg bg-background w-full text-xs sm:text-sm px-2 sm:px-3 py-2"
          size="sm"
        >
          <FileText className="mr-1 h-3 w-3" />
          <span className="hidden sm:inline">Export to PDF</span>
          <span className="sm:hidden">Export PDF</span>
        </Button>
        
        
        {!aiSummary && hasDebtGoal && (
          <Button 
            onClick={onGenerateToughLove}
            variant="destructive"
            className="shadow-lg w-full text-xs sm:text-sm px-2 sm:px-3 py-2"
            size="sm"
            disabled={isGeneratingSummary}
          >
            {isGeneratingSummary ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                <span className="hidden sm:inline">Getting tough...</span>
                <span className="sm:hidden">Loading...</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Tough Love</span>
                <span className="sm:hidden">Tough Love</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default FloatingActionButtons;
