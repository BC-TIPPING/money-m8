
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import GoalSuggestion from "./GoalSuggestion";

interface AISearchSectionProps {
  onGoalSuggested: (goal: string) => void;
}

const AISearchSection: React.FC<AISearchSectionProps> = ({ onGoalSuggested }) => {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedGoal, setSuggestedGoal] = useState<string | null>(null);
  
  const australianQuestions = [
    "How much super should I have at my age?",
    "What's the best savings account rate in Australia?",
    "Should I salary sacrifice to super or pay down debt?",
    "How do I claim tax deductions for investment properties?",
    "What's the current first home buyer grants in my state?",
    "How does negative gearing work in Australia?",
    "What are the best ETFs for Australian investors?",
    "How much emergency fund do I need in Australia?",
    "What's the difference between HECS and other debts?",
    "Should I invest in Australian or international shares?"
  ];

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

      const answerText = data.answer || 'Sorry, I couldn\'t process your question.';
      setAnswer(answerText);
      
      if (data.suggestedGoal) {
        setSuggestedGoal(data.suggestedGoal);
      }

      // Save the question and answer to the database
      try {
        await supabase
          .from('ai_questions')
          .insert({
            user_id: user?.id || null,
            question: question.trim(),
            answer: answerText,
            suggested_goal: data.suggestedGoal || null
          });
      } catch (dbError) {
        console.error('Error saving question to database:', dbError);
        // Don't show error to user as this is background functionality
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
    <div className="w-full mb-4">
      <form onSubmit={handleSubmit} className="space-y-2 max-w-xl mx-auto">
        <div className="flex gap-2">
          <Input
            placeholder="Ask me anything"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md flex-1 h-9 text-sm"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !question.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 min-w-[100px] h-9 text-sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <Select onValueChange={(value) => setQuestion(value)}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white backdrop-blur-md w-full h-9 text-sm">
            <SelectValue placeholder="Common financial questions..." />
          </SelectTrigger>
          <SelectContent className="bg-white z-50">
            {australianQuestions.map((q, index) => (
              <SelectItem key={index} value={q} className="text-xs sm:text-sm">{q}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </form>

      {isLoading && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-xl mx-auto">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-white">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Getting Australian financial knowledge...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {answer && (
        <div className="w-full max-w-2xl mx-auto mt-4">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <p className="text-center text-xs text-white/60 italic mb-3">
                Concise expert advice with practical examples
              </p>
              <div className="text-white space-y-3">
                {answer.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-white/95 leading-relaxed text-sm">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {suggestedGoal && (
        <div className="max-w-xl mx-auto">
          <GoalSuggestion 
            goal={suggestedGoal} 
            onSelectGoal={handleGoalSuggestion}
          />
        </div>
      )}
    </div>
  );
};

export default AISearchSection;
