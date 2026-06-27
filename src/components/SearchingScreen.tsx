import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import ScatteredPetals from "@/components/ScatteredPetals";

export const SEARCH_STEPS = [
  { from: 0, to: 10, label: "Ищу...", duration: 6000 },
  { from: 10, to: 25, label: "Убираю Фобо из списка", duration: 5500 },
  {
    from: 25,
    to: 40,
    label: "Исключаю странные рестораны в подвале",
    duration: 4680,
  },
  { from: 40, to: 65, label: "Выбираю что-то поинтереснее", duration: 5500 },
  { from: 65, to: 75, label: "Почти нашёл....", duration: 5500 },
  {
    from: 75,
    to: 88,
    label: "Быстренько создаю следующую страницу",
    duration: 5500,
  },
  { from: 88, to: 95, label: "Ещё чуть-чуть", duration: 5500 },
  { from: 95, to: 100, label: "Готово", duration: 5500 },
];

export interface SearchingScreenHandle {
  getFlowerPos: () => { x: number; y: number };
}

interface Props {
  onDone: () => void;
  transitioning?: boolean;
}

const SearchingScreen = forwardRef<SearchingScreenHandle, Props>(
  ({ onDone, transitioning }, ref) => {
    const [stepIdx, setStepIdx] = useState(0);
    const [pct, setPct] = useState(0);
    const flowerRef = useRef<HTMLSpanElement>(null);

    // Позволяем родителю запросить координаты лепестка
    useImperativeHandle(ref, () => ({
      getFlowerPos: () => {
        const r = flowerRef.current?.getBoundingClientRect();
        return r
          ? { x: r.left + r.width / 2, y: r.top + r.height / 2 }
          : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      },
    }));

    useEffect(() => {
      const raf = requestAnimationFrame(() => {
        setPct(SEARCH_STEPS[stepIdx].to);
      });
      return () => cancelAnimationFrame(raf);
    }, [stepIdx]);

    useEffect(() => {
      const isLast = stepIdx >= SEARCH_STEPS.length - 1;
      const t = setTimeout(
        () => {
          if (isLast) {
            onDone();
          } else {
            const next = stepIdx + 1;
            setPct(SEARCH_STEPS[next].from);
            setStepIdx(next);
          }
        },
        isLast ? 2500 : SEARCH_STEPS[stepIdx].duration,
      );
      return () => clearTimeout(t);
    }, [stepIdx, onDone]);

    const current = SEARCH_STEPS[stepIdx];

    return (
      <div className={`meme-page${transitioning ? " petals-frozen" : ""}`}>
        <ScatteredPetals />
        <div className="meme-card animate-in">
          <span ref={flowerRef} className="dive-flower">
            ♥️
          </span>
          <h1 className="meme-question" style={{ color: "var(--rose-dark)" }}>
            Минутку, нужно найти места для свидания, не ожидал, что ты скажешь
            да
          </h1>
          <div className="search-progress-wrap">
            <div className="search-progress-bar">
              <div
                className="search-progress-fill"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p
              className={`search-progress-label${transitioning ? " label-fade-out" : ""}`}
            >
              {current.label}
            </p>
          </div>
        </div>
      </div>
    );
  },
);

SearchingScreen.displayName = "SearchingScreen";
export default SearchingScreen;
