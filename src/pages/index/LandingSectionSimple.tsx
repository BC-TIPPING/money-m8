
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";

interface LandingSectionSimpleProps {
  onStartAssessment: (goal: string) => void;
  isLoading: boolean;
}

const LandingSectionSimple: React.FC<LandingSectionSimpleProps> = ({ onStartAssessment, isLoading }) => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const componentId = useRef(Math.random().toString(36).substr(2, 9));
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    console.log(`[SIMPLE DEBUG] Component ${componentId.current} - Render #${renderCount.current}`);
  }, []);

  const goals = ['Buy a house', 'Set a budget', 'Reduce debt'];

  const handleGoalSelect = (goal: string) => {
    console.log(`[SIMPLE DEBUG] Goal selected: ${goal}`);
    setSelectedGoal(goal);
  };

  const handleStartAssessment = () => {
    if (selectedGoal) {
      console.log(`[SIMPLE DEBUG] Starting assessment with: ${selectedGoal}`);
      onStartAssessment(selectedGoal);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100" data-component-id={componentId.current}>
      <div className="fixed top-4 right-4 bg-blue-500 text-white p-2 text-xs rounded">
        Simple Debug: {componentId.current} | Render #{renderCount.current}
      </div>
      
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold mb-8">Financial Health Check</h1>
        <p className="text-xl mb-8">Select your goal:</p>
        
        <div className="flex justify-center gap-4 mb-8">
          {goals.map((goal) => (
            <button
              key={goal}
              onClick={() => handleGoalSelect(goal)}
              className={`p-4 border rounded ${
                selectedGoal === goal ? 'bg-blue-500 text-white' : 'bg-white'
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
        
        <Button 
          onClick={handleStartAssessment}
          disabled={!selectedGoal || isLoading}
          className="px-8 py-4 text-lg"
        >
          {isLoading ? 'Starting...' : 'Start Assessment'}
        </Button>
      </div>
    </div>
  );
};

export default LandingSectionSimple;
