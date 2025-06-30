
import React from 'react';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface SaveResultsModalProps {
  showSavePrompt: boolean;
  onSaveResults: () => void;
  onContinueAnonymous: (e: React.MouseEvent) => void;
}

const SaveResultsModal: React.FC<SaveResultsModalProps> = ({
  showSavePrompt,
  onSaveResults,
  onContinueAnonymous
}) => {
  if (!showSavePrompt) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <Card className="w-full max-w-md relative z-[101]">
        <CardHeader>
          <CardTitle>Save Your Results?</CardTitle>
          <CardDescription>
            Your assessment is complete! Would you like to create an account to save your results and access them later?
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2">
          <Button onClick={onSaveResults} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Save Results (Create Account)
          </Button>
          <Button 
            type="button"
            onClick={onContinueAnonymous} 
            variant="outline" 
            className="w-full"
          >
            Continue Without Saving
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SaveResultsModal;
