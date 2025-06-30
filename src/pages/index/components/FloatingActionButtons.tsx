
import React from 'react';
import { Button } from "@/components/ui/button";
import { Save, FileDown, RotateCcw, Zap, Target } from 'lucide-react';

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
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-20">
      {aiSummary && (
        <Button onClick={onExportToPDF} className="shadow-lg">
          <FileDown className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      )}
      
      {!user && (
        <Button onClick={onSaveResults} className="shadow-lg">
          <Save className="mr-2 h-4 w-4" />
          Save Results
        </Button>
      )}
      
      <Button onClick={onChangeGoal} variant="outline" className="shadow-lg">
        <Target className="mr-2 h-4 w-4" />
        Change Goal
      </Button>
      
      <Button onClick={onStartOver} variant="outline" className="shadow-lg">
        <RotateCcw className="mr-2 h-4 w-4" />
        Start Over
      </Button>
      
      {hasDebtGoal && aiSummary && (
        <Button 
          onClick={onGenerateToughLove} 
          variant="secondary" 
          className="shadow-lg"
          disabled={isGeneratingSummary}
        >
          <Zap className="mr-2 h-4 w-4" />
          Tough Love Mode
        </Button>
      )}
    </div>
  );
};

export default FloatingActionButtons;
