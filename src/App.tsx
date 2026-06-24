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

  // Регистрируем глобальный триггер
  window.__petalStart = () => {
    setPetalActive(true);

    // Параметры громкости
    const startVolume = 0.1; // 5%
    const endVolume = 0.5; // 40%
    const duration = 5000; // 8 секунд

    // Проверяем наличие аудиоплеера
    if (!audioRef.current) {
      audioRef.current = new Audio(AUDIO_URL);
      audioRef.current.loop = true;
    }

    const audio = audioRef.current;

    // Если музыка уже играет, просто выходим (или перезапускаем при необходимости)
    if (!audio.paused) {
      return;
    }

    // Устанавливаем начальную громкость
    audio.volume = startVolume;

    // Запускаем воспроизведение
    audio.play().catch(() => {});

    // Если начальная и конечная громкость совпадают, анимация не нужна
    if (startVolume === endVolume) {
      return;
    }

    // Время начала анимации
    const startTime = performance.now();

    // Функция для обновления громкости
    const fadeIn = (currentTime) => {
      // Сколько времени прошло с начала анимации
      const elapsed = currentTime - startTime;

      // Если время вышло, устанавливаем финальную громкость и завершаем анимацию
      if (elapsed >= duration) {
        audio.volume = endVolume;
        return; // Анимация завершена
      }

      // Вычисляем текущую громкость по линейной интерполяции
      const progress = elapsed / duration; // от 0 до 1
      audio.volume = startVolume + (endVolume - startVolume) * progress;

      // Запрашиваем следующий кадр для плавности
      requestAnimationFrame(fadeIn);
    };

    // Запускаем анимацию
    requestAnimationFrame(fadeIn);
  };

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
