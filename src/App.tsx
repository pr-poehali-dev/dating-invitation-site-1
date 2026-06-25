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

  // --- НАЧАЛО ИЗМЕНЕНИЙ ---

  import { useCallback, useRef } from "react";

  // ... внутри вашего компонента ...
  const audioRef = useRef(null);
  const AUDIO_URL = "ссылка_на_вашу_музыку.mp3"; // Не забудьте указать свою ссылку

  // --- ЭТА ФУНКЦИЯ ОСТАЕТСЯ БЕЗ ИЗМЕНЕНИЙ ---
  // Она отвечает за само плавное нарастание громкости
  const handleVolumeRamp = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const startTime = parseFloat(audio.dataset.startTime);

    // Проверяем, было ли записано время начала
    if (!isNaN(startTime)) {
      const elapsed = audio.currentTime - startTime; // Сколько секунд прошло

      // Если прошло менее 8 секунд...
      if (elapsed < 5) {
        // ...плавно увеличиваем громкость от 0.01 до 0.03
        const targetVolume = Math.min(0.01 + (0.02 * elapsed) / 5, 0.03);
        audio.volume = targetVolume;
      } else {
        // Через 5 секунд ставим финальную громкость
        audio.volume = 0.03;
        // Отключаем слушатель, чтобы экономить ресурсы
        audio.removeEventListener("timeupdate", handleVolumeRamp);
      }
    }
  }, []);

  // --- НОВАЯ ФУНКЦИЯ ДЛЯ РАЗБЛОКИРОВКИ ЗВУКА ---
  // Эта функция обманывает браузер, заставляя его разрешить управление звуком.
  const unlockAudio = async () => {
    try {
      // Создаем новый контекст для работы со звуком
      const ctx = new (window.AudioContext || window.webkitAudioContext)();

      // "Возобновляем" работу контекста (это ключевая команда)
      await ctx.resume();

      // Создаем пустой источник звука (тишину)
      const buffer = ctx.createBufferSource();
      buffer.buffer = ctx.createBuffer(1, 1, 22050); // 1 канал, 1 секунда
      buffer.connect(ctx.destination);
      buffer.start(0);
      buffer.stop(0); // Сразу выключаем

      console.log("Звук успешно разблокирован");
    } catch (err) {
      console.error("Не удалось разблокировать звук:", err);
    }
  };

  // --- ГЛАВНАЯ ФУНКЦИЯ ЗАПУСКА МУЗЫКИ ---
  // Здесь мы собираем все части воедино
  window.__petalStart = useCallback(async () => {
    setPetalActive(true);

    // ЕСЛИ АУДИО ЕЩЕ НЕ СОЗДАНО...
    if (!audioRef.current) {
      audioRef.current = new Audio(AUDIO_URL);
      audioRef.current.loop = true;
      // ВАЖНО: УБИРАЕМ СТРОЧКУ .volume = 0.01 отсюда!
      // Теперь громкость будет контролироваться только функцией ramp-up.
    }

    const audio = audioRef.current;
    if (audio) {
      // ШАГ 1: Сначала разблокируем звук в браузере.
      // Это происходит очень быстро и незаметно для пользователя.
      await unlockAudio();

      // ШАГ 2: Записываем текущее время как точку старта.
      audio.dataset.startTime = audio.currentTime.toString();

      // ШАГ 3: Включаем нашу функцию контроля громкости.
      audio.addEventListener("timeupdate", handleVolumeRamp);

      // ШАГ 4: Вручную запускаем логику нарастания ОДИН раз,
      // чтобы она сработала мгновенно, а не через секунду.
      handleVolumeRamp();

      // ШАГ 5: Наконец, включаем музыку.
      audio.play().catch((error) => {
        console.error("Ошибка при попытке включить музыку:", error);
      });
    }
  }, [handleVolumeRamp]);

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
