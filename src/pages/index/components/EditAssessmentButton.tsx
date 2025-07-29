
import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit } from 'lucide-react';

interface EditAssessmentButtonProps {
  onEdit: () => void;
}

const EditAssessmentButton: React.FC<EditAssessmentButtonProps> = ({ onEdit }) => {
  return (
    <div className="fixed top-4 right-4 z-20">
      <Button
        onClick={onEdit}
        variant="outline"
        className="shadow-lg bg-background text-xs sm:text-sm px-2 sm:px-3"
        size="sm"
      >
        <Edit className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">Edit Assessment</span>
        <span className="sm:hidden">Edit</span>
      </Button>
    </div>
  );
};

export default EditAssessmentButton;
