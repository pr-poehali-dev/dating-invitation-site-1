import { useState, useEffect } from "react";
import ScatteredPetals from "@/components/ScatteredPetals";

// from — начало отрезка, to — конец, label — фраза на этом отрезке
// Каждый шаг длится 4 секунды
export const SEARCH_STEPS = [
  { from: 0,  to: 10,  label: "Ищу..." },
  { from: 10, to: 25,  label: "Убираю Фобо из списка" },
  { from: 25, to: 40,  label: "Исключаю странные рестораны в подвале" },
  { from: 40, to: 65,  label: "Выбираю что-то поинтереснее" },
  { from: 65, to: 75,  label: "Почти нашёл...." },
  { from: 75, to: 88,  label: "Быстренько делаю следующую страницу" },
  { from: 88, to: 95,  label: "Ещё чуть-чуть" },
  { from: 95, to: 100, label: "Готово" },
];

export default function SearchingScreen() {
  const [stepIdx, setStepIdx] = useState(0);
  // Сразу показываем to текущего шага, чтобы полоска начала двигаться
  const [pct, setPct] = useState(SEARCH_STEPS[0].to);

  useEffect(() => {
    if (stepIdx >= SEARCH_STEPS.length - 1) return;
    const t = setTimeout(() => {
      const next = stepIdx + 1;
      setStepIdx(next);
      setPct(SEARCH_STEPS[next].to);
    }, 4000);
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
