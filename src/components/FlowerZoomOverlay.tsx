import { useEffect } from "react";

interface Props {
  active: boolean;
  flowerPos: { x: number; y: number } | null;
}

export default function FlowerZoomOverlay({ active, flowerPos }: Props) {
  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;

    if (!active) {
      root.style.transform = "";
      root.style.transformOrigin = "";
      root.style.transition = "";
      return;
    }

    const cx = flowerPos?.x ?? window.innerWidth / 2;
    const cy = flowerPos?.y ?? window.innerHeight / 2;

    // Сначала фиксируем origin без transition
    root.style.transition = "none";
    root.style.transformOrigin = `${cx}px ${cy}px`;
    root.style.transform = "scale(1)";

    // Через два кадра запускаем плавный zoom
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.style.transition = "transform 3s cubic-bezier(0.1, 0, 0.05, 1)";
        root.style.transform = "scale(20)";
      });
    });

    return () => {
      root.style.transform = "";
      root.style.transformOrigin = "";
      root.style.transition = "";
    };
  }, [active, flowerPos]);

  return null;
}
