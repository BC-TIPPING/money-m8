
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Home, BookOpen, Target, CreditCard, Building, Calculator, TrendingUp, PiggyBank, ChevronLeft, ChevronRight } from 'lucide-react';

interface LandingSectionProps {
  onStartAssessment: (goal: string) => void;
  isLoading: boolean;
}

const LandingSection: React.FC<LandingSectionProps> = ({ onStartAssessment, isLoading }) => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const goals = [
    {
      title: 'Buy a house',
      icon: Home,
      description: 'Turn your dream of homeownership into a reality with a solid plan.',
      color: 'text-orange-400'
    },
    {
      title: 'Improve financial literacy',
      icon: BookOpen,
      description: 'Gain the knowledge to make confident financial decisions for your future.',
      color: 'text-green-400'
    },
    {
      title: 'Set a budget',
      icon: Target,
      description: 'Take control of your spending and master your cash flow.',
      color: 'text-purple-400'
    },
    {
      title: 'Reduce debt',
      icon: CreditCard,
      description: 'Create a strategic plan to eliminate debt and regain financial freedom.',
      color: 'text-red-400'
    },
    {
      title: 'Buy an investment property',
      icon: Building,
      description: 'Build wealth through property investment with expert guidance.',
      color: 'text-orange-400'
    },
    {
      title: 'Pay off home loan sooner',
      icon: Calculator,
      description: 'Save thousands in interest and own your home faster.',
      color: 'text-teal-400'
    },
    {
      title: 'Grow investments',
      icon: TrendingUp,
      description: 'Maximize your investment returns with personalized strategies.',
      color: 'text-blue-400'
    },
    {
      title: 'Maximise super',
      icon: PiggyBank,
      description: 'Boost your retirement savings and reduce your tax burden.',
      color: 'text-pink-400'
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

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, goals.length - 2));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, goals.length - 2)) % Math.max(1, goals.length - 2));
  };

  const visibleGoals = goals.slice(currentIndex, currentIndex + 3);

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative"
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

        <div className="mb-12 relative">
          {/* Navigation buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors"
          >
            <ChevronRight size={24} />
          </button>

          {/* Goal cards */}
          <div className="flex justify-center gap-6 px-12">
            {visibleGoals.map((goal, index) => {
              const Icon = goal.icon;
              return (
                <button
                  key={`${goal.title}-${currentIndex + index}`}
                  onClick={() => handleGoalSelect(goal.title)}
                  className={`
                    bg-black/40 backdrop-blur-sm border border-white/20
                    ${selectedGoal === goal.title ? 'ring-2 ring-white scale-105' : ''} 
                    text-white p-6 rounded-lg transition-all duration-300 transform hover:scale-105 
                    flex flex-col items-center text-center space-y-3 w-72 h-80 justify-center
                    hover:bg-black/50
                  `}
                >
                  <Icon size={48} className={`flex-shrink-0 ${goal.color}`} />
                  <h3 className="font-semibold text-lg leading-tight">{goal.title}</h3>
                  <p className="text-sm text-white/90 leading-relaxed">{goal.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Button 
            size="lg" 
            onClick={handleStartAssessment}
            disabled={!selectedGoal || isLoading}
            className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 px-8 py-3 text-lg font-semibold border border-white/30"
          >
            {isLoading ? 'Starting...' : 'Start Assessment'}
          </Button>
          
          {!selectedGoal && (
            <p className="text-white/60 text-sm">
              Please select a goal to continue
            </p>
          )}
        </div>

        <div className="mt-8 text-white/60 text-sm">
          <p>Try our assessment anonymously or <button className="underline hover:text-white">sign in</button> to save your results for later</p>
        </div>

        <div className="mt-12 text-white/50 text-xs">
          <p>© 2025 ClearFinAI | Financial clarity for Australians</p>
        </div>
      </div>
    </div>
  );
};

export default LandingSection;
