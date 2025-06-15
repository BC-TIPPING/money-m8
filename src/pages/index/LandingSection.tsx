
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const goalPanels = [
  { title: "Buy a house", description: "Turn your dream of homeownership into a reality with a solid plan.", emoji: "🏠" },
  { title: "Improve financial literacy", description: "Gain the knowledge to make confident financial decisions for your future.", emoji: "📚" },
  { title: "Set a budget", description: "Take control of your spending and master your cash flow.", emoji: "📊" },
  { title: "Reduce debt", description: "Create a strategy to pay down debts and achieve financial freedom.", emoji: "💳" },
  { title: "Grow investments", description: "Make your money work for you and build long-term wealth.", emoji: "📈" },
  { title: "Save for a purchase", description: "Whether it's a car or a holiday, we'll help you reach your savings goals.", emoji: "🎯" },
  { title: "Pay off home loan sooner", description: "Learn strategies to clear your mortgage faster and save thousands.", emoji: "🏡" },
  { title: "Maximise super", description: "Boost your retirement savings and take advantage of tax benefits.", emoji: "💰" },
];

const LandingSection = ({ onStartAssessment, isLoading }: { onStartAssessment: (goal: string) => void; isLoading: boolean; }) => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const { user } = useAuth();

  return (
    <div className="w-full min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#202336] via-[#28365a] to-[#191d29]">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)), url('/lovable-uploads/3b4aa2ff-8ca4-4b86-85e7-85b1d027ca73.png')`
        }}
      />
      <div className="absolute inset-0 z-1 bg-gradient-to-br from-emerald-900/20 via-blue-900/30 to-purple-900/20" />
      <main className="relative z-10 w-full flex flex-col items-center mt-6 md:mt-8 px-2">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 md:mb-2 text-center tracking-tight text-white drop-shadow-2xl">
          Financial health check
        </h1>
        <div className="text-2xl md:text-3xl font-semibold text-white/90 mb-0 mt-2 text-center drop-shadow-lg">
          Get a clear picture of your finances
        </div>
        <div className="text-lg md:text-xl text-white/80 mb-4 mt-2 max-w-2xl text-center drop-shadow font-medium">
          Select your primary goal to get started
        </div>
        <section className="w-full max-w-3xl mb-8 px-14">
          <Carousel opts={{ align: "center", loop: false }} className="w-full">
            <CarouselContent>
              {goalPanels.map((panel, i) => (
                <CarouselItem key={i} className="py-4 cursor-pointer md:basis-1/2 lg:basis-1/3 self-stretch" onClick={() => setSelectedGoal(panel.title)}>
                  <div className="p-1 h-full">
                    <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6 h-full flex flex-col items-center gap-3 transition-all hover:scale-105 hover:bg-white/15 ${selectedGoal === panel.title ? 'ring-4 ring-emerald-500 bg-white/20' : 'ring-transparent'}`}>
                      <span className="text-4xl">{panel.emoji}</span>
                      <span className="font-bold text-xl text-white text-center">{panel.title}</span>
                      <span className="text-base text-white/80 text-center">{panel.description}</span>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="bg-white/20 border-white/30 text-white hover:bg-white/30" />
            <CarouselNext className="bg-white/20 border-white/30 text-white hover:bg-white/30" />
          </Carousel>
        </section>
        <Button 
          size="lg" 
          className="text-xl px-12 py-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-2xl transform hover:scale-105 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
          onClick={() => {
            if (selectedGoal) {
              onStartAssessment(selectedGoal);
            }
          }}
          disabled={!selectedGoal || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Loading...
            </>
          ) : user ? (
            "Let's have a look"
          ) : (
            "Login to Start"
          )}
        </Button>
        {!selectedGoal && <p className="text-white/70 mt-4 animate-pulse">Please select a goal to continue</p>}
      </main>
      <footer className="mt-12 mb-6 text-sm text-white/60 z-10 text-center">
        &copy; {new Date().getFullYear()} ClearFin.AI&nbsp;&nbsp;|&nbsp;&nbsp;Financial clarity for Australians
      </footer>
    </div>
  );
}

export default LandingSection;
