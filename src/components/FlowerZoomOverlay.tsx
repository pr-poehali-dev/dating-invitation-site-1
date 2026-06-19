import { useEffect, useRef, useState } from "react";

interface Props {
  active: boolean;
  flowerPos: { x: number; y: number } | null;
}

// Цвет сердцевины лепестка 🌸
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

        // Фаза 2: погружаемся вперёд
        setTimeout(() => {
          root.style.transition = "transform 4.5s cubic-bezier(0.4, 0, 0.08, 1)";
          root.style.transform = "scale(80)";

          // Фаза 3: когда экран заполнен — показываем цветной оверлей
          setTimeout(() => {
            setCoverVisible(true);
            requestAnimationFrame(() => {
              requestAnimationFrame(() => setCoverOpacity(1));
            });

            // Фаза 4: сбрасываем root и плавно убираем оверлей
            setTimeout(() => {
              root.style.transition = "none";
              root.style.transform = "";
              root.style.transformOrigin = "";
              // Небольшая пауза чтобы страница успела смениться
              setTimeout(() => {
                setCoverOpacity(0);
                setTimeout(() => setCoverVisible(false), 1000);
              }, 80);
            }, 300);
          }, 4200);
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
        transition: coverOpacity === 0 ? "opacity 1.2s ease" : "opacity 0.15s ease",
        pointerEvents: "none",
      }}
    />
  );
}
