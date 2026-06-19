import { useEffect, useRef } from "react";

interface Props {
  active: boolean;
  flowerPos: { x: number; y: number } | null;
}

export default function FlowerZoomOverlay({ active, flowerPos }: Props) {
  const startedRef = useRef(false);

  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;

    // Сброс когда переход завершён
    if (!active) {
      startedRef.current = false;
      root.style.transition = "none";
      root.style.transform = "";
      root.style.transformOrigin = "";
      return;
    }

    // Запускаем zoom только один раз — когда появились координаты
    if (!flowerPos || startedRef.current) return;
    startedRef.current = true;

    const { x, y } = flowerPos;

    root.style.transition = "none";
    root.style.transformOrigin = `${x}px ${y}px`;
    root.style.transform = "scale(1)";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Фаза 1: отталкиваемся назад
        root.style.transition = "transform 0.7s cubic-bezier(0.25, 0, 0.5, 1)";
        root.style.transform = "scale(0.78)";

        // Фаза 2: погружаемся вперёд — медленно и плавно
        setTimeout(() => {
          root.style.transition = "transform 5.5s cubic-bezier(0.4, 0, 0.08, 1)";
          root.style.transform = "scale(80)";
        }, 750);
      });
    });
  }, [active, flowerPos]);

  return null;
}