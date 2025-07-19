
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, Sparkles } from 'lucide-react';
import GoalSuggestion from './GoalSuggestion';

interface AISearchSectionProps {
  onGoalSuggested: (goal: string) => void;
}

const exampleQuestions = [
  "How much super should I have at 30?",
  "What's the best home loan strategy?",
  "How can I reduce my tax this year?",
  "Should I salary sacrifice into super?",
  "What's a good emergency fund amount?",
  "How do I claim work from home expenses?",
  "Is it better to pay off debt or invest?",
  "What are the capital gains tax rules?"
];

const AISearchSection: React.FC<AISearchSectionProps> = ({ onGoalSuggested }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [suggestedGoal, setSuggestedGoal] = useState<string | null>(null);

  const { mutate: askQuestion, isPending } = useMutation({
    mutationFn: async (question: string) => {
      const { data, error } = await supabase.functions.invoke('ask-openai', {
        body: { question },
      });

      if (error) {
        throw new Error(error.message);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }

      return { answer: data.answer, suggestedGoal: data.suggestedGoal };
    },
    onSuccess: (data) => {
      setAnswer(data.answer);
      setSuggestedGoal(data.suggestedGoal);
    },
    onError: (err) => {
      console.error(err);
      setAnswer('Sorry, I encountered an error. Please try again.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      setAnswer('');
      setSuggestedGoal(null);
      askQuestion(question);
    }
  };

  const handleClearSearch = () => {
    setQuestion('');
    setAnswer('');
    setSuggestedGoal(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 px-4">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">Ask Our Australian Financial AI</h2>
          <Sparkles className="h-6 w-6 text-emerald-400" />
        </div>
        <p className="text-white/80 text-lg">
          Get expert advice based on ATO guidelines, Australian banking regulations, and Investor principles
        </p>
      </div>

      <div className="mb-4">
        <Select onValueChange={setQuestion}>
          <SelectTrigger className="w-full bg-white/10 backdrop-blur-md border-white/20 text-white">
            <SelectValue placeholder="Try an example question..." />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            {exampleQuestions.map((example, index) => (
              <SelectItem key={index} value={example} className="text-white hover:bg-gray-800">
                {example}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Or type your own question..."
              className="pl-10 pr-4 py-3 text-lg bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-emerald-400"
              disabled={isPending}
            />
          </div>
          <Button 
            type="submit" 
            disabled={isPending || !question.trim()}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Ask AI'}
          </Button>
        </div>
      </form>

      {(answer || isPending) && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-4">
          <CardContent className="p-6">
            {isPending ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400 mr-3" />
                <span className="text-white text-lg">Getting Australian financial advice...</span>
              </div>
            ) : (
              <>
                <div className="text-white/90 whitespace-pre-wrap mb-4 leading-relaxed">
                  {answer}
                </div>
                {suggestedGoal && (
                  <GoalSuggestion 
                    goal={suggestedGoal} 
                    onSelectGoal={onGoalSuggested}
                  />
                )}
                <Button 
                  variant="ghost" 
                  onClick={handleClearSearch}
                  className="text-white/70 hover:text-white hover:bg-white/10 mt-4"
                >
                  Ask another question
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AISearchSection;
