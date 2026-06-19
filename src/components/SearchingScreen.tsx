import { useState, useEffect } from "react";
import ScatteredPetals from "@/components/ScatteredPetals";

// from — начало отрезка, to — конец, label — фраза на этом отрезке
// Каждый шаг длится 4 секунды
export const SEARCH_STEPS = [
  { from: 0,  to: 10,  label: "Ищу...",                                  duration: 5000 },
  { from: 10, to: 25,  label: "Убираю Фобо из списка",                   duration: 4000 },
  { from: 25, to: 40,  label: "Исключаю странные рестораны в подвале",   duration: 4000 },
  { from: 40, to: 65,  label: "Выбираю что-то поинтереснее",             duration: 4000 },
  { from: 65, to: 75,  label: "Почти нашёл....",                         duration: 4000 },
  { from: 75, to: 88,  label: "Быстренько делаю следующую страницу",     duration: 4000 },
  { from: 88, to: 95,  label: "Ещё чуть-чуть",                          duration: 4000 },
  { from: 95, to: 100, label: "Готово",                                   duration: 4000 },
];

export default function SearchingScreen() {
  const [stepIdx, setStepIdx] = useState(0);
  // Стартуем с 0 — полоска поедет до to[0] благодаря CSS transition
  const [pct, setPct] = useState(0);

  // Через один кадр после монтирования/смены шага запускаем анимацию до to
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setPct(SEARCH_STEPS[stepIdx].to);
    });
    return () => cancelAnimationFrame(raf);
  }, [stepIdx]);

  // Через 4с переходим к следующему шагу (сбрасываем pct на from, потом raf двигает до to)
  useEffect(() => {
    if (stepIdx >= SEARCH_STEPS.length - 1) return;
    const t = setTimeout(() => {
      const next = stepIdx + 1;
      setPct(SEARCH_STEPS[next].from);
      setStepIdx(next);
    }, SEARCH_STEPS[stepIdx].duration);
    return () => clearTimeout(t);
  }, [stepIdx]);

  const current = SEARCH_STEPS[stepIdx];

  return (
    <div className="meme-page">
      <ScatteredPetals />
      <div className="meme-card animate-in">
        <h1 className="meme-question" style={{ color: "var(--rose-dark)" }}>
          Минутку, нужно найти места для свиданий, не ожидал, что ты скажешь да
        </h1>
        <div className="search-progress-wrap">
          <div className="search-progress-bar">
            <div
              className="search-progress-fill"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="search-progress-label">{current.label}</p>
        </div>
      </div>
    </div>
  );
}