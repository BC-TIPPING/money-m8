
import { useState } from "react";
import FinancialAssessmentModal from "../components/FinancialAssessmentModal";

const Index = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#f6f8fb] via-[#edf0f3] to-[#e8eaf6] relative flex flex-col items-center justify-center">
      {/* Subtle background illustration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-[-15%] top-[-15%] w-[500px] h-[500px] rounded-full blur-3xl opacity-40 bg-gradient-to-br from-[#7389f4] to-transparent"></div>
        <div className="absolute right-[-10%] bottom-[-10%] w-[400px] h-[400px] rounded-full blur-2xl opacity-30 bg-gradient-to-br from-[#63c5da] to-[#bfb5f6]"></div>
      </div>
      <main className="z-10 relative w-full flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center tracking-tight bg-gradient-to-r from-[#4346bc] to-[#3981c7] text-transparent bg-clip-text animate-fade-in">
          Get a clear picture of your finances – no jargon, no stress
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl text-center animate-fade-in">
          Start your journey to financial clarity. Take a quick assessment to receive tailored insights, education, and actionable next steps. Private, secure, and stress‑free.
        </p>
        <button
          className="px-8 py-3 rounded-lg font-semibold bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary animate-scale-in transition-all text-lg"
          onClick={() => setModalOpen(true)}
        >
          Start Financial Assessment
        </button>
        <FinancialAssessmentModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </main>
      <footer className="mt-20 mb-6 text-xs text-muted-foreground z-10 text-center">
        &copy; {new Date().getFullYear()} ClearFin.AI&nbsp;&nbsp;|&nbsp;&nbsp;No financial advice, just clarity.
      </footer>
    </div>
  );
};

export default Index;

