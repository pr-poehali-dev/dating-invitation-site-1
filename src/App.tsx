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

    // Запускаем музыку при нажатии "Да"
    if (!audioRef.current) {
      audioRef.current = new Audio(AUDIO_URL);
      audioRef.current.loop = true;
    }

    const audio = audioRef.current;

    // --- Параметры ---
    const startVolume = 0.1; // Начальная громкость (10%)
    const targetVolume = 0.2; // Целевая громкость (20%)
    const smoothFactor = 0.05; // Коэффициент сглаживания (чем меньше, тем медленнее)

    // Устанавливаем начальную громкость
    audio.volume = startVolume;

    // Функция для управления анимацией громкости
    function animateVolume() {
      // Проверяем, достигли ли мы целевой громкости с учетом небольшой погрешности
      if (Math.abs(audio.volume - targetVolume) > 0.001) {
        // Плавно двигаем текущую громкость к целевой
        audio.volume += (targetVolume - audio.volume) * smoothFactor;

        // Запрашиваем следующий кадр для продолжения анимации
        requestAnimationFrame(animateVolume);
      } else {
        // Убеждаемся, что громкость ровно равна целевой
        audio.volume = targetVolume;
      }
    }

    // Начинаем воспроизведение музыки
    audio
      .play()
      .then(() => {
        // Анимацию запускаем только ПОСЛЕ успешного начала воспроизведения
        animateVolume();
      })
      .catch((error) => {
        console.warn("Автовоспроизведение заблокировано браузером:", error);
      });
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
