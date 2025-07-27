
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowRight, TrendingUp, Calculator, Target, DollarSign, Shield, BarChart3, PiggyBank } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

interface LandingSectionProps {
  onStartAssessment: (goal: string) => void;
  isLoading: boolean;
}

export default function LandingSection({ onStartAssessment, isLoading }: LandingSectionProps) {
  const [aiQuestion, setAiQuestion] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const { user } = useAuth();

  // Reordered goals with Full Financial Health Check first
  const goals = [
    { id: 'Full Financial Health Check', label: 'Full Financial Health Check', icon: Shield, color: 'bg-emerald-500' },
    { id: 'Reduce debt', label: 'Reduce debt', icon: TrendingUp, color: 'bg-red-500' },
    { id: 'Set a budget', label: 'Set a budget', icon: Calculator, color: 'bg-blue-500' },
    { id: 'Buy a house', label: 'Buy a house', icon: Target, color: 'bg-green-500' },
    { id: 'Pay off home loan sooner', label: 'Pay off home loan sooner', icon: DollarSign, color: 'bg-purple-500' },
    { id: 'Maximise super', label: 'Maximise super', icon: PiggyBank, color: 'bg-orange-500' },
    { id: 'Buy an investment property', label: 'Buy an investment property', icon: BarChart3, color: 'bg-indigo-500' },
    { id: 'Grow investments', label: 'Grow investments', icon: TrendingUp, color: 'bg-teal-500' },
  ];

  const handleAIQuestionSubmit = () => {
    if (aiQuestion.trim()) {
      // Store the question in localStorage and navigate to AI page
      localStorage.setItem('aiQuestion', aiQuestion);
      window.location.href = '/ask-ai';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-emerald-900 mb-4">
            Your Personal Financial Coach
          </h1>
          <p className="text-lg text-emerald-700 max-w-2xl mx-auto">
            Get personalized financial advice and strategies to achieve your goals. 
            Our AI-powered assessment analyzes your situation and provides actionable insights.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border-emerald-200 bg-white/50">
              <CardHeader>
                <CardTitle className="text-emerald-900">🎯 Choose Your Goal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-emerald-700 text-sm">
                  Select what you want to achieve and get a personalized financial plan
                </p>
                <div className="space-y-2">
                  <Select onValueChange={setSelectedGoal}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="What's your main financial goal?" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      {goals.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id}>
                          {goal.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => selectedGoal && onStartAssessment(selectedGoal)}
                    disabled={!selectedGoal || isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isLoading ? 'Loading...' : 'Start Assessment'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-white/50">
              <CardHeader>
                <CardTitle className="text-emerald-900">🤖 Ask Our AI</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-emerald-700 text-sm">
                  Got a specific financial question? Ask our AI for instant advice
                </p>
                <div className="space-y-2">
                  <Input
                    placeholder="e.g., How much should I save for retirement?"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAIQuestionSubmit()}
                    className="w-full"
                  />
                  <Button 
                    onClick={handleAIQuestionSubmit}
                    disabled={!aiQuestion.trim()}
                    variant="outline"
                    className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  >
                    Ask AI
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {goals.slice(0, 4).map((goal) => {
              const Icon = goal.icon;
              return (
                <Card 
                  key={goal.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow border-emerald-200 bg-white/50"
                  onClick={() => onStartAssessment(goal.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`${goal.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-emerald-900 text-sm">{goal.label}</h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {goals.slice(4).map((goal) => {
              const Icon = goal.icon;
              return (
                <Card 
                  key={goal.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow border-emerald-200 bg-white/50"
                  onClick={() => onStartAssessment(goal.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`${goal.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-emerald-900 text-sm">{goal.label}</h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
