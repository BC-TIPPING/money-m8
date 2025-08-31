import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity } from 'lucide-react';

interface BackToHealthCheckButtonProps {
  onBackToHealthCheck: () => void;
  showButton?: boolean;
}

const BackToHealthCheckButton: React.FC<BackToHealthCheckButtonProps> = ({
  onBackToHealthCheck,
  showButton = true
}) => {
  if (!showButton) return null;

  return (
    <div className="mb-6">
      <Button 
        variant="outline" 
        size="sm"
        onClick={onBackToHealthCheck}
        className="flex items-center gap-2 hover:bg-blue-50 btn-touch focus-mobile"
      >
        <ArrowLeft className="h-4 w-4" />
        <Activity className="h-4 w-4" />
        <span className="hidden sm:inline">Back to Health Check</span>
        <span className="sm:hidden">Back</span>
      </Button>
    </div>
  );
};

export default BackToHealthCheckButton;