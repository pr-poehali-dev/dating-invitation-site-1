import "./App.css";
import { useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PetalAvalanche from "@/components/PetalAvalanche";

const queryClient = new QueryClient();

export type PetalTrigger = {
  start: () => void;
  onCovered: (cb: () => void) => void;
  onDone: (cb: () => void) => void;
};

// Глобальные колбэки — Index.tsx регистрирует их через window
declare global {
  interface Window {
    __petalStart?: () => void;
    __petalOnCovered?: () => void;
    __petalOnDone?: () => void;
  }
}

function AppInner() {
  const [petalActive, setPetalActive] = useState(false);

  const handleCovered = useCallback(() => {
    window.__petalOnCovered?.();
  }, []);

  const handleDone = useCallback(() => {
    setPetalActive(false);
    window.__petalOnDone?.();
  }, []);

  // Регистрируем глобальный триггер
  window.__petalStart = () => setPetalActive(true);

  return (
    <>
      <PetalAvalanche
        active={petalActive}
        onCovered={handleCovered}
        onDone={handleDone}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppInner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;