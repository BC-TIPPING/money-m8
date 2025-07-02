
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
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
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Improve financial literacy',
      icon: BookOpen,
      description: 'Gain the knowledge to make confident financial decisions for your future.',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Set a budget',
      icon: Target,
      description: 'Take control of your spending and master your cash flow.',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Reduce debt',
      icon: CreditCard,
      description: 'Create a strategic plan to eliminate debt and regain financial freedom.',
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      title: 'Buy an investment property',
      icon: Building,
      description: 'Build wealth through property investment with expert guidance.',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: 'Pay off home loan sooner',
      icon: Calculator,
      description: 'Save thousands in interest and own your home faster.',
      color: 'bg-teal-500 hover:bg-teal-600'
    },
    {
      title: 'Grow investments',
      icon: TrendingUp,
      description: 'Maximize your investment returns with personalized strategies.',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      title: 'Maximise super',
      icon: PiggyBank,
      description: 'Boost your retirement savings and reduce your tax burden.',
      color: 'bg-pink-500 hover:bg-pink-600'
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
      <div className="container px-4 md:px-6 text-center relative z-10 max-w-6xl">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Financial health check
          </h1>
          <p className="text-xl text-white/90 mb-2">
            Get a clear picture of your finances
          </p>
          <p className="text-lg text-white/80 mb-8">
            Select your primary goal to get started - no sign up required!
          </p>
        </div>

        <div className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {goals.map((goal) => {
              const Icon = goal.icon;
              return (
                <button
                  key={goal.title}
                  onClick={() => handleGoalSelect(goal.title)}
                  className={`
                    ${goal.color} 
                    ${selectedGoal === goal.title ? 'ring-4 ring-white scale-105' : ''} 
                    text-white p-6 rounded-lg transition-all duration-300 transform hover:scale-105 
                    flex flex-col items-center text-center space-y-3 min-h-[180px] justify-center
                  `}
                >
                  <Icon size={32} className="flex-shrink-0" />
                  <h3 className="font-semibold text-lg leading-tight">{goal.title}</h3>
                  <p className="text-sm text-white/90 leading-relaxed">{goal.description}</p>
                </button>
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
