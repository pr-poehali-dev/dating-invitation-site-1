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
  "https://www.image2url.com/r2/default/audio/1782330962431-a3aa2ab1-7c4a-4877-a714-0a5753d70882.mp3";

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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null); // для отмены анимации при необходимости

  const handleCovered = useCallback(() => {
    window.__petalOnCovered?.();
  }, []);

  const handleDone = useCallback(() => {
    setPetalActive(false);
    window.__petalOnDone?.();
  }, []);

  // Функция плавного нарастания громкости
  const fadeInVolume = (
    audio: HTMLAudioElement,
    startVol: number,
    endVol: number,
    durationMs: number,
  ) => {
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1); // от 0 до 1

      // Линейная интерполяция: start + (end - start) * progress
      const targetVol = startVol + (endVol - startVol) * progress;
      audio.volume = targetVol;

      if (progress < 1 && rafRef.current !== null) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        // После завершения анимации фиксируем громкость на целевом уровне
        audio.volume = endVol;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  };

  window.__petalStart = () => {
    setPetalActive(true);

    if (!audioRef.current) {
      audioRef.current = new Audio(AUDIO_URL);
      audioRef.current.loop = true;
      // Начальную громкость ставим сразу в 0.1 (10%), а дальше плавно поднимем
      audioRef.current.volume = 0.1;
    }

    // Запускаем воспроизведение
    audioRef.current.play().catch(() => {});

    // Плавно поднимаем громкость с 0.1 до 0.5 за 5000 мс (5 секунд)
    fadeInVolume(audioRef.current, 0.1, 0.5, 5000);
  };

  useEffect(() => {
    // Очистка при размонтировании компонента
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
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
