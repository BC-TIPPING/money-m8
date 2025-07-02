
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, TrendingUp, PiggyBank, Calculator, Target, BookOpen, Building, CreditCard } from 'lucide-react';

interface LandingSectionProps {
  onStartAssessment: (goal: string) => void;
  isLoading: boolean;
}

const LandingSection: React.FC<LandingSectionProps> = ({ onStartAssessment, isLoading }) => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const goals = [
    {
      title: 'Buy a house',
      icon: Home,
      description: 'Turn your dream of homeownership into a reality with a solid plan.',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      title: 'Improve financial literacy',
      icon: BookOpen,
      description: 'Gain the knowledge to make confident financial decisions for your future.',
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700'
    },
    {
      title: 'Set a budget',
      icon: Target,
      description: 'Take control of your spending and master your cash flow.',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700'
    },
    {
      title: 'Reduce debt',
      icon: CreditCard,
      description: 'Create a strategic plan to eliminate debt and regain financial freedom.',
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      hoverColor: 'hover:from-red-600 hover:to-red-700'
    },
    {
      title: 'Buy an investment property',
      icon: Building,
      description: 'Build wealth through property investment with expert guidance.',
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      hoverColor: 'hover:from-orange-600 hover:to-orange-700'
    },
    {
      title: 'Pay off home loan sooner',
      icon: Calculator,
      description: 'Save thousands in interest and own your home faster.',
      color: 'bg-gradient-to-br from-teal-500 to-teal-600',
      hoverColor: 'hover:from-teal-600 hover:to-teal-700'
    },
    {
      title: 'Grow investments',
      icon: TrendingUp,
      description: 'Maximize your investment returns with personalized strategies.',
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      hoverColor: 'hover:from-indigo-600 hover:to-indigo-700'
    },
    {
      title: 'Maximise super',
      icon: PiggyBank,
      description: 'Boost your retirement savings and reduce your tax burden.',
      color: 'bg-gradient-to-br from-pink-500 to-pink-600',
      hoverColor: 'hover:from-pink-600 hover:to-pink-700'
    }
  ];

  const handleGoalSelect = (goal: string) => {
    setSelectedGoal(goal);
  };

  const handleStartAssessment = () => {
    if (selectedGoal) {
      onStartAssessment(selectedGoal);
    }
  };

  return (
    <section 
      className="py-12 md:py-24 lg:py-32 min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: `url('/lovable-uploads/fd9ed9b4-cd2f-46bb-9a60-46979f3803f5.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="container px-4 md:px-6 text-center relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Financial health check
          </h1>
          <p className="text-xl text-white/90 mb-2">
            Get a clear picture of your finances
          </p>
          <p className="text-lg text-white/80">
            Select your primary goal to get started - no sign up required!
          </p>
        </div>

        <div className="max-w-6xl mx-auto mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {goals.map((goal) => {
              const Icon = goal.icon;
              return (
                <Card 
                  key={goal.title}
                  className={`${goal.color} ${goal.hoverColor} border-0 text-white cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    selectedGoal === goal.title ? 'ring-4 ring-white scale-105' : ''
                  }`}
                  onClick={() => handleGoalSelect(goal.title)}
                >
                  <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-3">
                      <Icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-white/90 text-sm">
                      {goal.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button 
              size="lg" 
              onClick={handleStartAssessment}
              disabled={!selectedGoal || isLoading}
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
            >
              {isLoading ? 'Starting...' : 'Start Assessment'}
            </Button>
            
            {!selectedGoal && (
              <p className="text-white/60 text-sm">
                Please select a goal to continue
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 text-white/60 text-sm">
          <p>Try our assessment anonymously or <button className="underline hover:text-white">sign in</button> to save your results for later</p>
        </div>

        <div className="mt-12 text-white/50 text-xs">
          <p>© 2025 ClearFinAI | Financial clarity for Australians</p>
        </div>
      </div>
    </section>
  );
};

export default LandingSection;
