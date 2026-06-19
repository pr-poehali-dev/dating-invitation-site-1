import { useEffect } from "react";

interface Props {
  active: boolean;
  flowerPos: { x: number; y: number } | null;
}

export default function FlowerZoomOverlay({ active, flowerPos }: Props) {
  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;

    if (!active || !flowerPos) {
      root.style.transition = "none";
      root.style.transform = "";
      root.style.transformOrigin = "";
      return;
    }

    const { x, y } = flowerPos;

    // transform-origin в точке лепестка — тогда scale увеличивает именно из неё
    root.style.transition = "none";
    root.style.transformOrigin = `${x}px ${y}px`;
    root.style.transform = "scale(1)";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.style.transition = "transform 3.5s cubic-bezier(0.12, 0, 0.06, 1)";
        root.style.transform = "scale(25)";
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
