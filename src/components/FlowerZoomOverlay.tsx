import { useEffect, useState } from "react";

interface Props {
  active: boolean;
  flowerPos: { x: number; y: number } | null;
}

// Цвет сердцевины эмодзи 🌸 — нежно-розовый
const CORE_COLOR = "#f9c8d9";

export default function FlowerZoomOverlay({ active, flowerPos }: Props) {
  const [phase, setPhase] = useState<"idle" | "zooming" | "filled">("idle");

  useEffect(() => {
    if (!active) {
      setPhase("idle");
      return;
    }
    setPhase("zooming");
    const t = setTimeout(() => setPhase("filled"), 1600);
    return () => clearTimeout(t);
  }, [active]);

  if (phase === "idle") return null;

  const cx = flowerPos?.x ?? window.innerWidth / 2;
  const cy = flowerPos?.y ?? window.innerHeight / 2;

  // Радиус круга должен покрыть весь экран из точки цветочка
  const maxDist = Math.sqrt(
    Math.max(cx, window.innerWidth - cx) ** 2 +
    Math.max(cy, window.innerHeight - cy) ** 2
  );
  const finalRadius = maxDist * 2.2;

  return (
    <div
      className="flower-zoom-overlay"
      style={{
        "--cx": `${cx}px`,
        "--cy": `${cy}px`,
        "--final-r": `${finalRadius}px`,
        "--core-color": CORE_COLOR,
      } as React.CSSProperties}
    >
      <div className={`flower-zoom-circle ${phase === "zooming" ? "flower-zoom-grow" : ""}`} />
    </div>
  );
}
