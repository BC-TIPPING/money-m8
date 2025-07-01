
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Home, TrendingUp, PiggyBank, Calculator, Target, BookOpen, Building, CreditCard } from 'lucide-react';

interface LandingSectionProps {
  onStartAssessment: (goal: string) => void;
  isLoading: boolean;
}

const LandingSection: React.FC<LandingSectionProps> = ({ onStartAssessment, isLoading }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const goals = [
    {
      title: 'Buy a house',
      icon: Home,
      description: 'Turn your dream of homeownership into a reality with a solid plan.'
    },
    {
      title: 'Improve financial literacy',
      icon: BookOpen,
      description: 'Gain the knowledge to make confident financial decisions for your future.'
    },
    {
      title: 'Set a budget',
      icon: Target,
      description: 'Take control of your spending and master your cash flow.'
    },
    {
      title: 'Reduce debt',
      icon: CreditCard,
      description: 'Create a strategic plan to eliminate debt and regain financial freedom.'
    },
    {
      title: 'Buy an investment property',
      icon: Building,
      description: 'Build wealth through property investment with expert guidance.'
    },
    {
      title: 'Pay off home loan sooner',
      icon: Calculator,
      description: 'Save thousands in interest and own your home faster.'
    },
    {
      title: 'Grow investments',
      icon: TrendingUp,
      description: 'Maximize your investment returns with personalized strategies.'
    },
    {
      title: 'Maximise super',
      icon: PiggyBank,
      description: 'Boost your retirement savings and reduce your tax burden.'
    }
  ];

  const goalsPerSlide = 3;
  const totalSlides = Math.ceil(goals.length / goalsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getCurrentGoals = () => {
    const start = currentSlide * goalsPerSlide;
    return goals.slice(start, start + goalsPerSlide);
  };

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

        <div className="relative max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-6 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevSlide}
              className="bg-white/20 text-white hover:bg-white/30 rounded-full"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <div className="flex gap-6 flex-1 justify-center max-w-4xl">
              {getCurrentGoals().map((goal, index) => {
                const Icon = goal.icon;
                return (
                  <Card 
                    key={goal.title}
                    className={`bg-white/10 backdrop-blur-sm border-white/20 text-white cursor-pointer transition-all duration-300 hover:bg-white/20 flex-1 max-w-xs ${
                      selectedGoal === goal.title ? 'ring-2 ring-white bg-white/20' : ''
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
                      <CardDescription className="text-white/80 text-sm">
                        {goal.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={nextSlide}
              className="bg-white/20 text-white hover:bg-white/30 rounded-full"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            {Array.from({ length: totalSlides }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentSlide ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
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
