
import React from "react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const adventurousPanels = [
  { title: "Chart Your Journey", description: "Imagine your financial path as a wild trek — we help you map it out.", emoji: "🗺️" },
  { title: "Climb Your Goals", description: "Reach summits: home, wealth, freedom. We're with you at every step.", emoji: "⛰️" },
  { title: "Navigate Uncertainty", description: "Weather every storm with insight and clarity, no matter the terrain.", emoji: "🌌" },
  { title: "Unlock Hidden Opportunities", description: "Discover financial secrets hidden in plain sight.", emoji: "🧭" },
  { title: "Equip for Adventure", description: "Tools, knowledge, confidence — your pack for the future.", emoji: "🛡️" },
];

const LandingSection = ({ onStartAssessment }: { onStartAssessment: () => void }) => (
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
      <div className="text-lg md:text-xl text-white/80 mb-8 mt-2 max-w-2xl text-center drop-shadow font-medium">
        – no jargon, no stress
      </div>
      <section className="w-full max-w-2xl mb-12">
        <Carousel opts={{ align: "center", loop: true }} className="w-full">
          <CarouselContent>
            {adventurousPanels.map((panel, i) => (
              <CarouselItem key={i} className="px-1 py-4">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6 flex flex-col items-center gap-3 transition-all hover:scale-105 hover:bg-white/15">
                  <span className="text-4xl">{panel.emoji}</span>
                  <span className="font-bold text-xl text-white">{panel.title}</span>
                  <span className="text-base text-white/80 text-center">{panel.description}</span>
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
        className="text-xl px-12 py-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-2xl transform hover:scale-105 transition-all"
        onClick={onStartAssessment}
      >
        Let's have a look
      </Button>
    </main>
    <footer className="mt-12 mb-6 text-sm text-white/60 z-10 text-center">
      &copy; {new Date().getFullYear()} ClearFin.AI&nbsp;&nbsp;|&nbsp;&nbsp;Financial clarity for Australians
    </footer>
  </div>
);

export default LandingSection;
