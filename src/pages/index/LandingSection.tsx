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
    <section className="py-12 md:py-24 lg:py-32 bg-gray-50 min-h-[80vh] flex items-center justify-center">
      <div className="container px-4 md:px-6 text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
          Take control of your finances today
        </h1>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 mt-4">
          Answer a few simple questions and we'll create a personalised plan to help you achieve your financial goals.
        </p>
        <div className="mt-8 space-y-2 sm:space-x-4 sm:space-y-0">
          {goals.map((goal, index) => (
            <Button key={index} size="lg" className="w-full sm:w-auto" onClick={() => onStartAssessment(goal)} disabled={isLoading}>
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
