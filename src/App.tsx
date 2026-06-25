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
  "https://www.image2url.com/r2/default/files/1782379512329-7b5291f3-ab05-4204-b990-03d18524b72a.mp3";

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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleCovered = useCallback(() => {
    window.__petalOnCovered?.();
  }, []);

  const handleDone = useCallback(() => {
    setPetalActive(false);
    window.__petalOnDone?.();
  }, []);

  // --- НАЧАЛО ИЗМЕНЕНИЙ ---

  // Эта функция будет управлять плавным нарастанием громкости
  const handleVolumeRamp = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const currentTime = audio.currentTime;
    const startTime = audio.dataset.startTime;

    // Проверяем, было ли записано время начала
    if (startTime) {
      const elapsed = currentTime - parseFloat(startTime);

      // Если прошло менее 5 секунд, плавно увеличиваем громкость
      if (elapsed < 5) {
        // Линейная интерполяция от 0.1 до 0.5 за 5 секунд
        const targetVolume = Math.min(0.005 + (0.04 * elapsed) / 8, 0.08);
        audio.volume = targetVolume;
      } else {
        // По истечении 5 секунд устанавливаем громкость на 0.5
        audio.volume = 0.08;
        // Отключаем слушатель, чтобы он больше не вызывался
        audio.removeEventListener("timeupdate", handleVolumeRamp);
      }
    }
  }, []);

  // Регистрируем глобальный триггер с новой логикой
  window.__petalStart = useCallback(() => {
    setPetalActive(true);

    if (!audioRef.current) {
      audioRef.current = new Audio(AUDIO_URL);
      audioRef.current.loop = true;
      // Устанавливаем начальную громкость сразу при создании объекта
      audioRef.current.volume = 0.1;
    }

    const audio = audioRef.current;
    if (audio) {
      // Записываем текущее время воспроизведения как время старта эффекта
      audio.dataset.startTime = audio.currentTime.toString();

      // Добавляем слушатель для управления громкостью
      audio.addEventListener("timeupdate", handleVolumeRamp);

      // Запускаем воспроизведение
      audio.play().catch(() => {});
    }
  }, [handleVolumeRamp]); // Не забудьте добавить handleVolumeRamp в зависимости

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
