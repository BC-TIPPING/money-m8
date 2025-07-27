
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AISearchSectionProps {
  onGoalSuggested: (goal: string) => void;
}

const AISearchSection: React.FC<AISearchSectionProps> = ({ onGoalSuggested }) => {
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
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Ask me anything about Australian finances..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md flex-1"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !question.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 min-w-[120px]"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <Select onValueChange={(value) => setQuestion(value)}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white backdrop-blur-md">
            <SelectValue placeholder="Or choose from common Australian financial questions..." />
            <ChevronDown className="h-4 w-4 text-white/60" />
          </SelectTrigger>
          <SelectContent className="bg-white z-50">
            {australianQuestions.map((q, index) => (
              <SelectItem key={index} value={q}>{q}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </form>
      
      <p className="text-center text-xs text-white/60 italic mb-3">
        Get expert knowledge based on ATO guidelines, Australian banking regulations, and Barefoot Investor principles
      </p>

      {isLoading && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-white">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Getting Australian financial knowledge...</span>
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
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="text-white text-sm mb-2">
              Suggested Goal: <span className="font-semibold">{suggestedGoal}</span>
            </div>
            <Button 
              onClick={() => handleGoalSuggestion(suggestedGoal)}
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              Add This Goal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AISearchSection;
