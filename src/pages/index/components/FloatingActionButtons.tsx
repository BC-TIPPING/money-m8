
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Loader2, FileText, Save, Target, RotateCcw } from 'lucide-react';

interface FloatingActionButtonsProps {
  isComplete: boolean;
  user: any;
  aiSummary: string | null;
  hasDebtGoal: boolean;
  isGeneratingSummary: boolean;
  onExportToPDF: () => void;
  onSaveResults: () => void;
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
  onSaveResults,
  onStartOver,
  onChangeGoal,
  onGenerateToughLove
}) => {
  if (!isComplete) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm px-4">
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-2 w-full">
          <Button
            onClick={onChangeGoal}
            variant="outline"
            className="shadow-lg bg-background flex-1"
          >
            <Target className="mr-2 h-4 w-4" />
            Change Goal
          </Button>
          <Button
            onClick={onStartOver}
            variant="outline"
            className="shadow-lg bg-background flex-1"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Start Over
          </Button>
        </div>
        
        <Button onClick={onExportToPDF} variant="outline" className="shadow-lg bg-background w-full">
          <FileText className="mr-2 h-4 w-4" />
          Export to PDF
        </Button>
        
        {!user && (
          <Button 
            onClick={onSaveResults}
            className="shadow-lg w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Results
          </Button>
        )}
        
        {!aiSummary && hasDebtGoal && (
          <Button 
            onClick={onGenerateToughLove}
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
  );
};

export default FloatingActionButtons;
