import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import GoalSuggestion from "./GoalSuggestion";

interface HealthCheckAISearchSectionProps {
  assessmentData?: any;
  onGoalSuggested?: (goal: string) => void;
}

const HealthCheckAISearchSection: React.FC<HealthCheckAISearchSectionProps> = ({ 
  assessmentData, 
  onGoalSuggested 
}) => {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedGoal, setSuggestedGoal] = useState<string | null>(null);
  const answerRef = useRef<HTMLDivElement>(null);
  
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

  // Auto-scroll to answer when it appears
  useEffect(() => {
    if (answer && answerRef.current) {
      answerRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  }, [answer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    console.log('Submitting question:', question);
    setIsLoading(true);
    setAnswer('');
    setSuggestedGoal(null);

    try {
      // Include assessment data context for personalized responses
      const contextualQuestion = assessmentData ? 
        `${question} with assessment data` : question;

      const { data, error } = await supabase.functions.invoke('ask-openai', {
        body: { 
          question: contextualQuestion,
          assessmentData: assessmentData 
        }
      });

      console.log('Response from ask-openai:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

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
    if (onGoalSuggested) {
      onGoalSuggested(goal);
    }
    setSuggestedGoal(null);
    setAnswer('');
    setQuestion('');
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Ask Your Personal Financial Assistant
        </h3>
        <p className="text-muted-foreground">
          Get instant Australian financial recommendations powered by AI
        </p>
        
        {/* Personalization notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-2">
            <div className="text-blue-600 text-sm font-medium">💡</div>
            <div className="text-left">
              <p className="text-sm text-blue-700 font-medium">Personalized for You</p>
              <p className="text-sm text-blue-600">
                This AI assistant has access to your assessment responses and will provide 
                tailored advice based on your income, expenses, debts, goals, and financial situation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
        <div className="flex gap-2">
          <Input
            placeholder="Ask me anything about your finances..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !question.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 min-w-[100px]"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <Select onValueChange={(value) => setQuestion(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Common financial questions..." />
          </SelectTrigger>
          <SelectContent className="bg-white z-50">
            {australianQuestions.map((q, index) => (
              <SelectItem key={index} value={q} className="text-sm">{q}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </form>

      {/* Loading State */}
      {isLoading && (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Getting personalized Australian financial knowledge...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Answer */}
      {answer && (
        <div ref={answerRef} className="w-full max-w-3xl mx-auto">
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-6">
              <p className="text-center text-xs text-muted-foreground italic mb-4">
                Personalized financial recommendations
              </p>
              <div className="space-y-4">
                {answer.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Goal Suggestion */}
      {suggestedGoal && (
        <div className="max-w-2xl mx-auto">
          <GoalSuggestion 
            goal={suggestedGoal} 
            onSelectGoal={handleGoalSuggestion}
          />
        </div>
      )}
    </div>
  );
};

export default HealthCheckAISearchSection;