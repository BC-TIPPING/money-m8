
import React from 'react';
import { Button } from '@/components/ui/button';
import { Target, ArrowRight } from 'lucide-react';

interface GoalSuggestionProps {
  goal: string;
  onSelectGoal: (goal: string) => void;
}

const GoalSuggestion: React.FC<GoalSuggestionProps> = ({ goal, onSelectGoal }) => {
  const goalEmojis: { [key: string]: string } = {
    "Buy a house": "🏠",
    "Improve financial literacy": "📚",
    "Set a budget": "📊",
    "Reduce debt": "💳",
    "Grow investments": "📈",
    "Save for a purchase": "🎯",
    "Pay off home loan sooner": "🏡",
    "Maximise super": "💰",
  };

  return (
    <div className="bg-emerald-600/20 border border-emerald-400/30 rounded-lg p-4 mt-4 w-full">
      <div className="flex items-center gap-3 mb-3">
        <Target className="h-5 w-5 text-emerald-400" />
        <span className="text-emerald-400 font-semibold">Recommended Goal</span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{goalEmojis[goal] || "🎯"}</span>
          <div>
            <h4 className="text-white font-semibold text-lg">{goal}</h4>
            <p className="text-white/70">This goal matches your question perfectly</p>
          </div>
        </div>
        
        <Button
          onClick={() => onSelectGoal(goal)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 flex items-center gap-2"
        >
          Select Goal
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default GoalSuggestion;
