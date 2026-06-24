import { useEffect, useRef, useState } from "react";

interface Props {
  active: boolean;
  flowerPos: { x: number; y: number } | null;
}

// Цвет сердцевины лепестка ♥️
const CORE_COLOR = "#c0435a";

export default function FlowerZoomOverlay({ active, flowerPos }: Props) {
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
      return;
    }

    if (!flowerPos || startedRef.current) return;
    startedRef.current = true;

    const { x, y } = flowerPos;

    root.style.transition = "none";
    root.style.transformOrigin = `${x}px ${y}px`;
    root.style.transform = "scale(1)";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Фаза 1: отпрыгиваем назад
        root.style.transition = "transform 0.7s cubic-bezier(0.25, 0, 0.5, 1)";
        root.style.transform = "scale(0.78)";

        // Фаза 2: логарифмическое погружение — визуально одинаковая скорость
        setTimeout(() => {
          const DURATION = 5000; // мс
          const START_SCALE = 0.78;
          const END_SCALE = 300;
          const startTime = performance.now();

          const rafRef = { id: 0 };

          function tick(now: number) {
            const t = Math.min((now - startTime) / DURATION, 1);
            // логарифмическая интерполяция — каждый % времени даёт одинаковый визуальный прирост
            const scale = START_SCALE * Math.pow(END_SCALE / START_SCALE, t);
            root!.style.transition = "none";
            root!.style.transform = `scale(${scale})`;

            if (t < 1) {
              rafRef.id = requestAnimationFrame(tick);
            } else {
              // Фаза 3: оверлей
              setCoverVisible(true);
              requestAnimationFrame(() => {
                requestAnimationFrame(() => setCoverOpacity(1));
              });
              // Фаза 4: убираем оверлей
              setTimeout(() => {
                root!.style.transition = "none";
                root!.style.transform = "";
                root!.style.transformOrigin = "";
                setTimeout(() => {
                  setCoverOpacity(0);
                  setTimeout(() => setCoverVisible(false), 1200);
                }, 80);
              }, 500);
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
          coverOpacity === 0 ? "opacity 1.2s ease" : "opacity 0.15s ease",
        pointerEvents: "none",
      }}
    />
  );
}