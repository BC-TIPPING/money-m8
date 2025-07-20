
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
        className="shadow-lg bg-background w-2/3"
        size="sm"
      >
        <Edit className="mr-2 h-4 w-4" />
        Edit Assessment
      </Button>
    </div>
  );
};

export default EditAssessmentButton;
