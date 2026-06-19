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
      root.style.transition = "none";
      root.style.transform = "";
      return;
    }

    const S = 22; // финальный масштаб
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Точка цветочка в координатах экрана
    const fx = flowerPos?.x ?? vw / 2;
    const fy = flowerPos?.y ?? vh / 2;

    // При scale(S) с transform-origin: 0 0, точка (fx, fy) уедет в (fx*S, fy*S).
    // Чтобы она оказалась в центре экрана, нужно сдвинуть на:
    const tx = vw / 2 - fx * S;
    const ty = vh / 2 - fy * S;

    // Сбрасываем без анимации
    root.style.transition = "none";
    root.style.transformOrigin = "0 0";
    root.style.transform = "scale(1) translate(0, 0)";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.style.transition = "transform 3.5s cubic-bezier(0.12, 0, 0.06, 1)";
        root.style.transform = `scale(${S}) translate(${tx / S}px, ${ty / S}px)`;
      });
    });

    return () => {
      root.style.transition = "none";
      root.style.transform = "";
      root.style.transformOrigin = "";
    };
  }, [active, flowerPos]);

  return null;
}
