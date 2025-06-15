
import { useState } from "react";
import FinancialAssessmentModal from "../components/FinancialAssessmentModal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const adventurousPanels = [
  {
    title: "Chart Your Journey",
    description: "Imagine your financial path as a wild trek — we help you map it out.",
    emoji: "🗺️",
  },
  {
    title: "Climb Your Goals",
    description: "Reach summits: home, wealth, freedom. We’re with you at every step.",
    emoji: "⛰️",
  },
  {
    title: "Navigate Uncertainty",
    description: "Weather every storm with insight and clarity, no matter the terrain.",
    emoji: "🌌",
  },
  {
    title: "Unlock Hidden Opportunities",
    description: "Discover financial secrets hidden in plain sight.",
    emoji: "🧭",
  },
  {
    title: "Equip for Adventure",
    description: "Tools, knowledge, confidence — your pack for the future.",
    emoji: "🛡️",
  },
];

const Index = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="w-full min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#191d29] via-[#23263a] to-[#282e3a]">
      {/* Adventurous background: animated gradients, blobs, subtle stars */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Dynamic aurora gradient */}
        <div className="absolute left-0 top-0 w-[120%] h-[90%] -translate-x-1/12 -translate-y-1/12 bg-gradient-to-br from-[#211e50] via-[#253472] to-transparent animate-[move-bg_16s_ease-in-out_infinite_alternate] opacity-50 blur-2xl" style={{animationName:"move-bg"}} />
        <div className="absolute right-[-15%] bottom-[-8%] w-[600px] h-[400px] bg-gradient-to-br from-[#46b1ea] via-transparent to-[#9989c4] rounded-full blur-3xl opacity-30 animate-pulse" />
        {/* Subtle starfield */}
        <svg className="absolute inset-0 w-full h-full opacity-20" style={{zIndex:1}} xmlns="http://www.w3.org/2000/svg">
          <circle cx="10%" cy="20%" r="1" fill="#fff" />
          <circle cx="30%" cy="80%" r="1" fill="#fff" />
          <circle cx="70%" cy="15%" r="0.7" fill="#fff" />
          <circle cx="85%" cy="50%" r="1.2" fill="#fff" />
          <circle cx="52%" cy="72%" r="0.6" fill="#fff" />
          <circle cx="60%" cy="35%" r="1.4" fill="#fff" />
          <circle cx="24%" cy="64%" r="1" fill="#fff" />
          <circle cx="45%" cy="38%" r="0.7" fill="#fff" />
        </svg>
      </div>

      {/* MAIN HERO CONTENT */}
      <main className="relative z-10 w-full flex flex-col items-center">
        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-center tracking-tight bg-gradient-to-r from-[#89c5e6] via-[#fac778] to-[#9bf0e1] text-transparent bg-clip-text animate-fade-in">
          Get a clear picture of your finances – no jargon, no stress
        </h1>
        <p className="text-lg text-[#b5b5cc] mb-8 max-w-xl text-center animate-fade-in">
          Start your journey to financial clarity. Take a quick assessment to receive tailored insights, education, and actionable next steps. Private, secure, and stress‑free.
        </p>

        {/* Rolling selection panel / carousel */}
        <section className="w-full max-w-2xl mb-8">
          <Carousel
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {adventurousPanels.map((panel, i) => (
                <CarouselItem key={i} className="px-1 py-4">
                  <div className="bg-[#22273c] border border-[#393e54]/60 rounded-2xl shadow-xl p-6 flex flex-col items-center gap-2 transition-all hover-scale">
                    <span className="text-4xl">{panel.emoji}</span>
                    <span className="font-bold text-xl text-sky-200">{panel.title}</span>
                    <span className="text-base text-[#b5b5cc] text-center">{panel.description}</span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </section>

        <button
          className="px-8 py-3 rounded-lg font-semibold bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary animate-scale-in transition-all text-lg"
          onClick={() => setModalOpen(true)}
        >
          Start Financial Assessment
        </button>
        <FinancialAssessmentModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </main>
      <footer className="mt-20 mb-6 text-xs text-[#7d7ead] z-10 text-center">
        &copy; {new Date().getFullYear()} ClearFin.AI&nbsp;&nbsp;|&nbsp;&nbsp;No financial advice, just clarity.
      </footer>
      {/* Extra aurora gradient keyframes */}
      <style>
        {`
          @keyframes move-bg {
            0% { transform: translate(-10%, -10%) scale(1);}
            100% { transform: translate(-3%, 10%) scale(1.1);}
          }
        `}
      </style>
    </div>
  );
};

export default Index;
