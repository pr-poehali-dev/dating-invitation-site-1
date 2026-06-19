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
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        let pos = { x: cx, y: cy };

        if (petals && petals.length > 0) {
          const visible = Array.from(petals).filter(el => {
            const r = el.getBoundingClientRect();
            return r.top > 0 && r.bottom < window.innerHeight && r.left > 0 && r.right < window.innerWidth;
          });
          if (visible.length > 0) {
            // Берём лепесток, ближайший к центру экрана
            const closest = visible.reduce((best, el) => {
              const r = el.getBoundingClientRect();
              const ex = r.left + r.width / 2;
              const ey = r.top + r.height / 2;
              const dist = Math.hypot(ex - cx, ey - cy);
              const br = best.getBoundingClientRect();
              const bdist = Math.hypot(br.left + br.width / 2 - cx, br.top + br.height / 2 - cy);
              return dist < bdist ? el : best;
            });
            const r = closest.getBoundingClientRect();
            pos = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
          }
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
    <div ref={ref} className={`meme-page${transitioning ? " petals-frozen" : ""}`}>
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