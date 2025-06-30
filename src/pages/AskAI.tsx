
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MessageCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from 'react-router-dom';

const EXAMPLE_QUESTIONS = [
  "What is the First Home Owner Grant in Australia?",
  "How does negative gearing work for Australian property investors?",
  "What are the current superannuation contribution limits?",
  "How does the Australian tax system work for different income brackets?",
  "What is stamp duty and how much should I budget for it?",
  "Should I salary sacrifice into superannuation?",
  "What's the difference between offset accounts and redraw facilities?",
  "How do I claim tax deductions for investment properties in Australia?"
];

export default function AskAI() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const { mutate: askQuestion, isPending, error } = useMutation({
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

      return data.answer;
    },
    onSuccess: (data) => {
      setAnswer(data);
    },
    onError: (err) => {
        console.error(err);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      setAnswer('');
      askQuestion(question);
    }
  };

  const handleExampleClick = (exampleQuestion: string) => {
    setQuestion(exampleQuestion);
    setAnswer('');
    askQuestion(exampleQuestion);
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Ask a Financial Question
          </CardTitle>
          <CardDescription>
            Get answers to Australian financial questions powered by AI. Try one of the examples below or ask your own question.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., What is the First Home Owner Grant in Australia?"
                disabled={isPending}
              />
              <Button type="submit" disabled={isPending || !question.trim()}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Ask'}
              </Button>
            </div>
          </form>

          {/* Example Questions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-700">Try these Australian financial questions:</h3>
            <div className="grid gap-2">
              {EXAMPLE_QUESTIONS.map((exampleQuestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-auto p-3 text-wrap"
                  onClick={() => handleExampleClick(exampleQuestion)}
                  disabled={isPending}
                >
                  {exampleQuestion}
                </Button>
              ))}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          {answer && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-2">Answer:</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{answer}</p>
            </div>
          )}
        </CardContent>
      </Card>
      <Button asChild variant="link" className="mt-4">
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  );
}
