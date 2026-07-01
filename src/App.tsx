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
const AUDIO_URL =
  "https://www.image2url.com/r2/default/files/1782894069167-1a029f6f-b39b-4ce3-b490-9a44cfa63b8d.mp3";

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
  const audioRef = useRef<HTMLAudioElement | null>(
    (() => {
      const a = new Audio(AUDIO_URL);
      a.loop = true; // Трек будет повторяться автоматически
      a.volume = 0.1; // Начальная громкость
      a.preload = "auto";
      return a;
    })(),
  );

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
      // Просто запускаем воспроизведение без лишних манипуляций
      audio.play().catch(() => {});
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
