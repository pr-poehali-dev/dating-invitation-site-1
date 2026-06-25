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
import { useState, useCallback, useRef } from "react";

const queryClient = new QueryClient();
const AUDIO_URL = "https://www.image2url.com/r2/default/audio/1782330962431-a3aa2ab1-7c4a-4877-a714-0a5753d70882.mp3";

export type PetalTrigger = {
  start: () => void;
  onCovered: (cb: () => void) => void;
  onDone: (cb: () => void) => void;
};
declare global {
  interface Window {
    __petalStart?: () => void;
    // ...
  }
}

function AppInner() {
  const [petalActive, setPetalActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Новая переменная состояния для контроля процесса фейда
  const [isFading, setIsFading] = useState(false); 

  const handleCovered = useCallback(() => {
    window.__petalOnCovered?.();
  }, []);

  const handleDone = useCallback(() => {
    setPetalActive(false);
    window.__petalOnDone?.();
  }, []);

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

   // Регистрируем глобальный триггер с новой логикой
  window.__petalStart = () => {
    if (isFading || petalActive) return; // Предотвращаем повторный вызов во время анимации

    setPetalActive(true);
    setIsFading(true); // Начинаем процесс фейда

    if (!audioRef.current) {
      audioRef.current = new Audio(AUDIO_URL);
      audioRef.current.loop = true;
    }

    const audio = audioRef.current;
    if (!audio) return;

    // Начальные параметры
    const durationMs = 5000; // Общая длительность анимации: 5 секунд
    const targetVolume = 0.5; // Целевая громкость: 50%
    const initialVolume = 0.1; // Стартовая громкость: 10%
    const stepsCount = Math.round(durationMs / 50); // Количество шагов (каждые 50 мс)
    const volumeStep = (targetVolume - initialVolume) / stepsCount; // Шаг изменения громкости за один интервал

    // Устанавливаем начальную громкость
    audio.volume = initialVolume;

    // Функция для запуска воспроизведения и анимации
    const playAndFade = async () => {
      try {
        await audio.play(); // Пробуем запустить музыку
      } catch (error) {
        console.error("Автовоспроизведение заблокировано браузером", error);
        setIsFading(false); // Останавливаем анимацию, если звук не запустился
        return;
      }

      let currentStep = 0;
      const fadeInterval = setInterval(() => {
        if (currentStep < stepsCount && !audio.paused) {
          // Увеличиваем громкость на шаг
          audio.volume += volumeStep;
          currentStep++;
        } else {
          // Анимация завершена или музыка поставлена на паузу
          clearInterval(fadeInterval);
          // Фиксируем итоговую громкость на случай погрешностей вычислений
          audio.volume = targetVolume;
          setIsFading(false);
        }
      }, 50);
    };

    playAndFade();
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