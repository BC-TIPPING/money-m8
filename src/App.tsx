
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ReactNode } from "react";
import AskAI from "./pages/AskAI";
import PayOffHomeLoanPage from "./pages/PayOffHomeLoan";
import MaximiseSuperPage from "./pages/MaximiseSuper";

const queryClient = new QueryClient();

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/ask-ai" element={<AskAI />} />
            <Route path="/pay-off-home-loan" element={<PayOffHomeLoanPage />} />
            <Route path="/maximise-super" element={<MaximiseSuperPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
