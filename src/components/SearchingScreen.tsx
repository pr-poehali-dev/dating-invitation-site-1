import { useState, useEffect, useRef, forwardRef } from "react";
import ScatteredPetals from "@/components/ScatteredPetals";

export const SEARCH_STEPS = [
  { from: 0,  to: 10,  label: "Ищу...",                                duration: 5000 },
  { from: 10, to: 25,  label: "Убираю Фобо из списка",                 duration: 4000 },
  { from: 25, to: 40,  label: "Исключаю странные рестораны в подвале", duration: 4000 },
  { from: 40, to: 65,  label: "Выбираю что-то поинтереснее",           duration: 4000 },
  { from: 65, to: 75,  label: "Почти нашёл....",                       duration: 4000 },
  { from: 75, to: 88,  label: "Быстренько делаю следующую страницу",   duration: 4000 },
  { from: 88, to: 95,  label: "Ещё чуть-чуть",                        duration: 4000 },
  { from: 95, to: 100, label: "Готово",                                 duration: 4000 },
];

interface Props {
  onDone: (flowerPos: { x: number; y: number }) => void;
  transitioning?: boolean;
}

const SearchingScreen = forwardRef<HTMLDivElement, Props>(({ onDone, transitioning }, ref) => {
  const [stepIdx, setStepIdx] = useState(0);
  const [pct, setPct] = useState(0);
  const petalsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setPct(SEARCH_STEPS[stepIdx].to);
    });
    return () => cancelAnimationFrame(raf);
  }, [stepIdx]);

  useEffect(() => {
    const isLast = stepIdx >= SEARCH_STEPS.length - 1;
    const t = setTimeout(() => {
      if (isLast) {
        const petals = petalsRef.current?.querySelectorAll<HTMLElement>(".falling-petal");
        let pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        if (petals && petals.length > 0) {
          const visible = Array.from(petals).filter(el => {
            const r = el.getBoundingClientRect();
            return r.top > 20 && r.top < window.innerHeight - 20 && r.left > 20 && r.left < window.innerWidth - 20;
          });
          const target = visible[Math.floor(Math.random() * visible.length)] ?? petals[0];
          const r = target.getBoundingClientRect();
          pos = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }
        onDone(pos);
      } else {
        const next = stepIdx + 1;
        setPct(SEARCH_STEPS[next].from);
        setStepIdx(next);
      }
    }, isLast ? 2500 : SEARCH_STEPS[stepIdx].duration);
    return () => clearTimeout(t);
  }, [stepIdx, onDone]);

  const current = SEARCH_STEPS[stepIdx];

  return (
    <div ref={ref} className="meme-page">
      <div ref={petalsRef}>
        <ScatteredPetals />
      </div>
      <div className="meme-card animate-in">
        <h1 className="meme-question" style={{ color: "var(--rose-dark)" }}>
          Минутку, нужно найти места для свидания, не ожидал, что ты скажешь да
        </h1>
        <div className="search-progress-wrap">
          <div className="search-progress-bar">
            <div
              className="search-progress-fill"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className={`search-progress-label${transitioning ? " label-fade-out" : ""}`}>{current.label}</p>
        </div>
      </div>
    </div>
  );
});

SearchingScreen.displayName = "SearchingScreen";
export default SearchingScreen;
