import { useEffect, useRef, useState } from "react";

interface Props {
  active: boolean;
  flowerPos: { x: number; y: number } | null;
  onCovered?: () => void;
}

const CORE_COLOR = "#f4a6c4";

export default function FlowerZoomOverlay({
  active,
  flowerPos,
  onCovered,
}: Props) {
  const startedRef = useRef(false);
  const [coverOpacity, setCoverOpacity] = useState(0);
  const [coverVisible, setCoverVisible] = useState(false);

  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;

    if (!active) {
      startedRef.current = false;
      root.style.transition = "none";
      root.style.transform = "";
      root.style.transformOrigin = "";
      root.classList.remove("zooming", "deep-zoom");
      return;
    }

    if (!flowerPos || startedRef.current) return;
    startedRef.current = true;

    const { x, y } = flowerPos;

    root.style.transition = "none";
    root.classList.add("zooming");
    root.style.transformOrigin = `${x}px ${y}px`;
    root.style.transform = "scale(1)";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Фаза 1: отпрыгиваем назад
        root.style.transition = "transform 0.7s cubic-bezier(0.25, 0, 0.5, 1)";
        root.style.transform = "scale(0.6)";

        // Фаза 2: логарифмическое погружение — визуально одинаковая скорость
        setTimeout(() => {
          const DURATION = 2200;
          const START_SCALE = 0.6;
          const END_SCALE = 300;
          let coverStarted = false;
          let deep = false;
          const startTime = performance.now();

          const rafRef = { id: 0 };

          function tick(now: number) {
            const t = Math.min((now - startTime) / DURATION, 1);
            // логарифмическая интерполяция — каждый % времени даёт одинаковый визуальный прирост
            const scale = START_SCALE * Math.pow(END_SCALE / START_SCALE, t);
            root!.style.transition = "none";
            root!.style.transform = `scale(${scale})`;

            if (!deep && scale > 12) {
              deep = true;
              root!.classList.add("deep-zoom");
            }

            if (!coverStarted && t >= 0.85) {
              coverStarted = true;
              setCoverVisible(true);
              requestAnimationFrame(() => {
                requestAnimationFrame(() => setCoverOpacity(1));
              });
            }

            if (t < 1) {
              rafRef.id = requestAnimationFrame(tick);
            } else {
              // Фаза 4: сбрасываем зум и меняем страницу пока экран красный
              setTimeout(() => {
                root!.style.transition = "none";
                root!.style.transform = "";
                root!.style.transformOrigin = "";
                root!.classList.remove("zooming", "deep-zoom");
                onCovered?.(); // <- страница 3 появляется под красным экраном
              }, 300);

              // Фаза 5: красный медленно тает — страница 3 проявляется
              setTimeout(() => {
                setCoverOpacity(0);
                setTimeout(() => setCoverVisible(false), 3600);
              }, 800);
            }
          }

          rafRef.id = requestAnimationFrame(tick);
        }, 750);
      });
    });
  }, [active, flowerPos]);

  if (!coverVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: CORE_COLOR,
        opacity: coverOpacity,
        transition:
          coverOpacity === 0
            ? "opacity 3.5s cubic-bezier(0.45, 0, 0.25, 1)"
            : "opacity 0.4s ease",
        pointerEvents: "none",
      }}
    />
  );
}