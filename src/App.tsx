import "./App.css";
import { useState, useCallback, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PetalAvalanche from "@/components/PetalAvalanche";

const queryClient = new QueryClient();
const AUDIO_URL = "/track.mp3";

export type PetalTrigger = {
  start: () => void;
  onCovered: (cb: () => void) => void;
  onDone: (cb: () => void) => void;
};

declare global {
  interface Window {
    __petalStart?: () => void;
    __petalOnCovered?: () => void;
    __petalOnDone?: () => void;
  }
}

function AppInner() {
  const [petalActive, setPetalActive] = useState(false);

  // Создаем аудиотег с нужными параметрами (loop, volume, preload)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  if (!audioRef.current) {
    const a = new Audio(AUDIO_URL);
    a.loop = true;
    a.volume = 1;
    a.preload = "auto";
    audioRef.current = a;
  }

  const handleCovered = useCallback(() => {
    window.__petalOnCovered?.();
  }, []);

  const handleDone = useCallback(() => {
    setPetalActive(false);
    window.__petalOnDone?.();
  }, []);

  // Глобальный триггер для запуска эффекта и музыки
  window.__petalStart = useCallback(() => {
    setPetalActive(true);

    const audio = audioRef.current;
    if (audio) {
      audio.muted = false;
      audio.play().catch(() => {
        const retry = () => {
          audio.play().catch(() => {});
          document.removeEventListener("pointerdown", retry);
          document.removeEventListener("touchend", retry);
        };
        document.addEventListener("pointerdown", retry);
        document.addEventListener("touchend", retry);
      });
    }
  }, []);

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