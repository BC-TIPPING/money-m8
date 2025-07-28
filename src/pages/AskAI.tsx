
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from 'react-router-dom';

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

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader>
          <CardTitle>Ask a Financial Question</CardTitle>
          <CardDescription>Enter a simple financial question to test the OpenAI integration.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., What is a Roth IRA?"
                disabled={isPending}
              />
              <Button type="submit" disabled={isPending || !question.trim()}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Ask'}
              </Button>
            </div>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          {answer && (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
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
