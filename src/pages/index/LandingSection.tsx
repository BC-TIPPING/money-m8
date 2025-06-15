
import React from "react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const goalPanels = [
  { title: "Buy a House", description: "Turn your dream of homeownership into a reality with a solid plan.", emoji: "🏠" },
  { title: "Improve Financial Literacy", description: "Gain the knowledge to make confident financial decisions for your future.", emoji: "📚" },
  { title: "Set a Budget", description: "Take control of your spending and master your cash flow.", emoji: "📊" },
  { title: "Reduce Debt", description: "Create a strategy to pay down debts and achieve financial freedom.", emoji: "💳" },
  { title: "Grow Investments", description: "Make your money work for you and build long-term wealth.", emoji: "📈" },
  { title: "Save for a Purchase", description: "Whether it's a car or a holiday, we'll help you reach your savings goals.", emoji: "🎯" },
  { title: "Pay Off Your Home Loan", description: "Learn strategies to clear your mortgage faster and save thousands.", emoji: "🏡" },
];

const LandingSection = ({ onStartAssessment }: { onStartAssessment: () => void }) => (
  <div className="w-full min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-background">
    <main className="relative z-10 w-full flex flex-col items-center mt-6 md:mt-8 px-2">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-2 md:mb-2 text-center tracking-tight text-foreground">
        Financial health check
      </h1>
      <div className="text-2xl md:text-3xl font-semibold text-foreground/90 mb-0 mt-2 text-center">
        Get a clear picture of your finances
      </div>
      <div className="text-lg md:text-xl text-foreground/80 mb-8 mt-2 max-w-2xl text-center font-medium">
        no jargon, no stress
      </div>
      <section className="w-full max-w-2xl mb-12">
        <Carousel opts={{ align: "center", loop: true }} className="w-full">
          <CarouselContent>
            {goalPanels.map((panel, i) => (
              <CarouselItem key={i} className="px-1 py-4">
                <div className="bg-card/80 backdrop-blur-md border border-border rounded-2xl shadow-xl p-6 flex flex-col items-center gap-3 transition-all hover:scale-105 hover:border-primary/50">
                  <span className="text-4xl">{panel.emoji}</span>
                  <span className="font-bold text-xl text-foreground">{panel.title}</span>
                  <span className="text-base text-foreground/80 text-center">{panel.description}</span>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="bg-card border-border text-foreground hover:bg-accent hover:text-accent-foreground" />
          <CarouselNext className="bg-card border-border text-foreground hover:bg-accent hover:text-accent-foreground" />
        </Carousel>
      </section>
      <Button 
        size="lg" 
        className="text-xl px-12 py-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-2xl transform hover:scale-105 transition-all"
        onClick={onStartAssessment}
      >
        Let's have a look
      </Button>
    </main>
    <footer className="mt-12 mb-6 text-sm text-foreground/60 z-10 text-center">
      &copy; {new Date().getFullYear()} ClearFin.AI&nbsp;&nbsp;|&nbsp;&nbsp;Financial clarity for Australians
    </footer>
  </div>
);

export default LandingSection;
