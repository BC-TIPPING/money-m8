
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target } from 'lucide-react';

interface GoalNavigationHeaderProps {
  currentGoals: string[];
  onBackToGoals: () => void;
  showBackButton?: boolean;
}

const GoalNavigationHeader: React.FC<GoalNavigationHeaderProps> = ({
  currentGoals,
  onBackToGoals,
  showBackButton = true
}) => {
  if (!showBackButton || currentGoals.length === 0) return null;

  return (
    <div className="sticky-mobile border-b border-gray-200 container-mobile">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm text-gray-600">Current Goal{currentGoals.length > 1 ? 's' : ''}</p>
            <p className="font-semibold text-gray-900 text-responsive">
              {currentGoals.join(', ')}
            </p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onBackToGoals}
          className="flex items-center gap-2 btn-touch focus-mobile"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Change Goal</span>
          <span className="sm:hidden">Change</span>
        </Button>
      </div>
    </div>
  );
};

export default GoalNavigationHeader;
