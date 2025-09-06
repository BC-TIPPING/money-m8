
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
  assessmentData?: any;
}

const AISearchSection: React.FC<AISearchSectionProps> = ({ onGoalSuggested, assessmentData }) => {
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
        body: { 
          question,
          assessmentData: assessmentData ? {
            incomeSources: assessmentData.incomeSources,
            expenseItems: assessmentData.expenseItems,
            debtDetails: assessmentData.debtDetails,
            goals: assessmentData.goals,
            age: assessmentData.age,
            superBalance: assessmentData.superBalance,
            assets: assessmentData.assets,
            postcode: assessmentData.postcode
          } : null
        }
      });

      if (error) throw error;

      const answerText = data?.answer || 'Sorry, I couldn\'t process your question.';
      setAnswer(answerText);
      
      if (data?.suggestedGoal) {
        setSuggestedGoal(data.suggestedGoal);
      }

      // Scroll to answer when it appears
      setTimeout(() => {
        const answerElement = document.querySelector('[data-answer-section]');
        if (answerElement) {
          answerElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

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
      {/* Section Header */}
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ask Your Personal Financial Assistant
        </h2>
        <p className="text-gray-600 text-lg mb-4">
          Get instant Australian financial recommendations powered by AI
        </p>
        {assessmentData && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 max-w-2xl mx-auto">
            <p className="text-sm text-blue-800">
              💡 <strong>Personalized for You:</strong> This AI assistant has access to your assessment responses and will provide tailored advice based on your income, expenses, debts, goals, and financial situation.
            </p>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-2 max-w-xl mx-auto">
        <div className="flex gap-2">
          <Input
            placeholder="Ask me anything"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 flex-1 h-9 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
      </form>

      {isLoading && (
        <Card className="bg-white border-gray-200 shadow-lg max-w-xl mx-auto mt-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Getting personalized financial recommendations...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {answer && (
        <div className="w-full max-w-2xl mx-auto mt-6 mb-8" data-answer-section>
          <Card className="bg-white border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <p className="text-center text-xs text-gray-500 italic mb-4">
                Personalized financial recommendations
              </p>
              <div className="text-gray-800 space-y-4">
                {answer.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {suggestedGoal && (
        <div className="max-w-xl mx-auto mt-6">
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
