
import React from 'react';
import { Button } from "@/components/ui/button";
import { Rocket } from 'lucide-react';

interface LandingSectionProps {
  onStartAssessment: (goal: string) => void;
  isLoading: boolean;
}

const LandingSection: React.FC<LandingSectionProps> = ({ onStartAssessment, isLoading }) => {
  const goals = [
    'Reduce debt',
    'Buy a house',
    'Buy an investment property',
    'Pay off home loan sooner',
    'Grow investments',
    'Set a budget',
    'Maximise super',
    'Improve financial literacy'
  ];

  return (
    <section 
      className="py-12 md:py-24 lg:py-32 min-h-[80vh] flex items-center justify-center relative"
      style={{
        background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}
    >
      <div className="container px-4 md:px-6 text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-white">
          Take control of your finances today
        </h1>
        <p className="mx-auto max-w-[700px] text-white/90 md:text-xl mt-4">
          Answer a few simple questions and we'll create a personalised plan to help you achieve your financial goals.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-4">
          {goals.map((goal, index) => (
            <Button 
              key={index} 
              size="lg" 
              className="w-full sm:w-auto bg-white text-purple-600 hover:bg-gray-100" 
              onClick={() => onStartAssessment(goal)} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Rocket className="mr-2 h-4 w-4 animate-spin" />
                  Analysing...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  {goal}
                </>
              )}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingSection;
