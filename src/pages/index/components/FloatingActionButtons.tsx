
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
        <div className="flex gap-2 w-2/3">
          <Button
            onClick={onChangeGoal}
            variant="outline"
            className="shadow-lg bg-background flex-1 text-sm px-3 py-2"
            size="sm"
          >
            <Target className="mr-1 h-3 w-3" />
            Change Goal
          </Button>
          <Button
            onClick={onStartOver}
            variant="outline"
            className="shadow-lg bg-background flex-1 text-sm px-3 py-2"
            size="sm"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Start Over
          </Button>
        </div>
        
        <Button 
          onClick={onExportToPDF} 
          variant="outline" 
          className="shadow-lg bg-background w-2/3 text-sm px-3 py-2"
          size="sm"
        >
          <FileText className="mr-1 h-3 w-3" />
          Export to PDF
        </Button>
        
        {!user && (
          <Button 
            onClick={onSaveResults}
            className="shadow-lg w-2/3 text-sm px-3 py-2"
            size="sm"
          >
            <Save className="mr-1 h-3 w-3" />
            Save Results
          </Button>
        )}
        
        {!aiSummary && hasDebtGoal && (
          <Button 
            onClick={onGenerateToughLove}
            variant="destructive"
            className="shadow-lg w-2/3 text-sm px-3 py-2"
            size="sm"
            disabled={isGeneratingSummary}
          >
            {isGeneratingSummary ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
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
