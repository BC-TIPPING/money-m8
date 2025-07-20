
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import GoalSuggestion from "./GoalSuggestion";

interface AISearchSectionProps {
  onGoalSuggested: (goal: string) => void;
}

const AISearchSection: React.FC<AISearchSectionProps> = ({ onGoalSuggested }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedGoal, setSuggestedGoal] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setAnswer('');
    setSuggestedGoal(null);

    try {
      const { data, error } = await supabase.functions.invoke('ask-openai', {
        body: { question }
      });

      if (error) throw error;

      setAnswer(data.answer || 'Sorry, I couldn\'t process your question.');
      if (data.suggestedGoal) {
        setSuggestedGoal(data.suggestedGoal);
      }
    } catch (error) {
      console.error('Error calling AI function:', error);
      setAnswer('Sorry, there was an error processing your question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoalSuggestion = (goal: string) => {
    onGoalSuggested(goal);
    setSuggestedGoal(null);
    setAnswer('');
    setQuestion('');
  };

  return (
    <div className="w-full max-w-2xl mb-4">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <Input
          placeholder="Ask me anything about Australian finances..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          disabled={isLoading || !question.trim()}
          className="bg-emerald-600 hover:bg-emerald-700 w-2/3 max-w-[120px]"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
      
      <p className="text-center text-xs text-white/60 italic mb-3">
        Get expert assistance based on ATO guidelines, Australian banking regulations, and Barefoot Investor principles
      </p>

      {isLoading && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-white">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Getting Australian financial assistance...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {answer && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-3">
          <CardContent className="p-4">
            <div className="text-white text-sm whitespace-pre-wrap">{answer}</div>
          </CardContent>
        </Card>
      )}

      {suggestedGoal && (
        <GoalSuggestion 
          goal={suggestedGoal} 
          onSelectGoal={handleGoalSuggestion}
        />
      )}
    </div>
  );
};

export default AISearchSection;
