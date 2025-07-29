
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Loader2, DollarSign, TrendingUp } from "lucide-react";
import AISearchSection from "./components/AISearchSection";

const goalPanels = [
  { title: "Full Financial Health Check", description: "Get a comprehensive analysis of your entire financial situation.", emoji: "📊" },
  { title: "Reduce debt", description: "Create a strategy to pay down debts and achieve freedom.", emoji: "💳" },
  { title: "Set a budget", description: "Take control of your spending and master your cash flow.", emoji: "💰" },
  { title: "Buy a house", description: "Turn your dream of homeownership into a reality with a solid plan.", emoji: "🏠" },
  { title: "Buy an investment property", description: "Build wealth through property investment with smart strategies.", emoji: "🏘️" },
  { title: "Improve financial literacy", description: "Gain the knowledge to make confident decisions for your future.", emoji: "📚" },
  { title: "Grow investments", description: "Make your money work for you and build long-term wealth.", emoji: "📈" },
  { title: "Save for a purchase", description: "Whether it's a car or a holiday, we'll help you reach your savings goals.", emoji: "🎯" },
  { title: "Pay off home loan sooner", description: "Learn strategies to clear your mortgage faster and save thousands.", emoji: "🏡" },
  { title: "Maximise super", description: "Boost your retirement savings and take advantage of tax benefits.", emoji: "💼" },
];

const LandingSection = ({ onStartAssessment, isLoading }: { onStartAssessment: (goal: string) => void; isLoading: boolean; }) => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const handleGoalSuggestion = (goal: string) => {
    setSelectedGoal(goal);
    // Scroll to goals section
    const goalsSection = document.getElementById('goals-section');
    if (goalsSection) {
      goalsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#202336] via-[#28365a] to-[#191d29]">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.6)), url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYXVzdHJhbGlhbl9jdXJyZW5jeSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPjxnIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwRkY4MCIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTUiLz48Y2lyY2xlIGN4PSI4MCIgY3k9IjIwIiByPSIxMCIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjEyIi8+PGNpcmNsZSBjeD0iMjAiIGN5PSI4MCIgcj0iOCIvPjxjaXJjbGUgY3g9IjgwIiBjeT0iODAiIHI9IjE0Ii8+PHBhdGggZD0iTTEwIDEwTDkwIDkwTTkwIDEwTDEwIDkwIi8+PC9nPjx0ZXh0IHg9IjQ1IiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMDBGRjgwIiBvcGFjaXR5PSIwLjEiPiQ8L3RleHQ+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2F1c3RyYWxpYW5fY3VycmVuY3kpIi8+PC9zdmc+')`
        }}
      />
      <div className="absolute inset-0 z-1 bg-gradient-to-br from-emerald-900/20 via-blue-900/30 to-purple-900/20" />
      
      <main className="relative z-10 w-full flex flex-col items-center mt-4 md:mt-6 px-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <DollarSign className="h-6 w-6 md:h-7 md:w-7 text-emerald-400" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-center tracking-tight text-white drop-shadow-2xl">
            Money M8
          </h1>
          <TrendingUp className="h-6 w-6 md:h-7 md:w-7 text-emerald-400" />
        </div>

        <div className="mb-8">
          <AISearchSection onGoalSuggested={handleGoalSuggestion} />
        </div>

        <section id="goals-section" className="w-full max-w-3xl mb-4 sm:mb-6 px-4 sm:px-8 md:px-14">
          <div className="text-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Choose Your Goal</h2>
          </div>
          
          <Carousel opts={{ align: "center", loop: false }} className="w-full">
            <CarouselContent>
              {goalPanels.map((panel, i) => (
                <CarouselItem key={i} className="py-2 sm:py-3 cursor-pointer basis-full xs:basis-1/2 md:basis-1/2 lg:basis-1/3 self-stretch" onClick={() => setSelectedGoal(panel.title)}>
                  <div className="p-1 h-full">
                    <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-3 sm:p-4 h-full flex flex-col items-center gap-1 sm:gap-2 transition-all hover:scale-105 hover:bg-white/15 ${selectedGoal === panel.title ? 'ring-4 ring-emerald-500 bg-white/20' : 'ring-transparent'}`}>
                      <span className="text-2xl sm:text-3xl">{panel.emoji}</span>
                      <span className="font-bold text-sm sm:text-lg text-white text-center leading-tight">{panel.title}</span>
                      <span className="text-xs sm:text-sm text-white/80 text-center leading-tight">{panel.description}</span>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="bg-white/20 border-white/30 text-white hover:bg-white/30 left-0 sm:left-2" />
            <CarouselNext className="bg-white/20 border-white/30 text-white hover:bg-white/30 right-0 sm:right-2" />
          </Carousel>
        </section>
        
        <Button 
          size="lg" 
          className="text-sm sm:text-lg px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-2xl transform hover:scale-105 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none w-4/5 sm:w-2/3 max-w-md"
          onClick={() => {
            if (selectedGoal) {
              onStartAssessment(selectedGoal);
            }
          }}
          disabled={!selectedGoal || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              Loading...
            </>
          ) : (
            "Start Assessment"
          )}
        </Button>
        {!selectedGoal && <p className="text-white/70 mt-2 sm:mt-3 animate-pulse text-xs sm:text-sm">Please select a goal to continue</p>}
      </main>
      
    </div>
  );
}

export default LandingSection;
