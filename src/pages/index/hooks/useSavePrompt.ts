
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseSavePromptProps {
  isComplete: boolean;
  user: any;
}

export const useSavePrompt = ({ isComplete, user }: UseSavePromptProps) => {
  const navigate = useNavigate();
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [hasDismissedSavePrompt, setHasDismissedSavePrompt] = useState(false);

  // Show save prompt when assessment is complete and user is not logged in
  useEffect(() => {
    if (isComplete && !user && !showSavePrompt && !hasDismissedSavePrompt) {
      setShowSavePrompt(true);
    }
  }, [isComplete, user, showSavePrompt, hasDismissedSavePrompt]);

  const handleSaveResults = () => {
    navigate('/auth');
  };

  const handleContinueAnonymous = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Continue anonymous clicked');
    setShowSavePrompt(false);
    setHasDismissedSavePrompt(true);
  };

  const resetDismissedFlag = () => {
    setHasDismissedSavePrompt(false);
  };

  return {
    showSavePrompt,
    handleSaveResults,
    handleContinueAnonymous,
    resetDismissedFlag
  };
};
