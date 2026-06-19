import { useState, useEffect } from "react";
import ScatteredPetals from "@/components/ScatteredPetals";

export const SEARCH_STEPS = [
  { pct: 0, label: "Ищу..." },
  { pct: 10, label: "Убираю Фобо из списка" },
  { pct: 30, label: "Исключаю странные рестораны в подвале" },
  { pct: 50, label: "Выбираю что-то поинтереснее" },
  { pct: 75, label: "Почти нашёл...." },
  { pct: 90, label: "Быстренько делаю следующую страницу" },
  { pct: 97, label: "Ещё чуть-чуть" },
  { pct: 100, label: "Готово!)" },
];

export default function SearchingScreen() {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (stepIdx >= SEARCH_STEPS.length - 1) return;
    const t = setTimeout(() => setStepIdx((i) => i + 1), 4000);
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
              style={{ width: `${current.pct}%` }}
            />
          </div>
          <p className="search-progress-label">{current.label}</p>
        </div>
      </div>
    </div>
  );
}
