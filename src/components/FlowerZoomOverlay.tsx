import { useEffect, useRef } from "react";

interface Props {
  active: boolean;
  flowerPos: { x: number; y: number } | null;
  pageRef: React.RefObject<HTMLDivElement>;
}

export default function FlowerZoomOverlay({ active, flowerPos, pageRef }: Props) {
  const animRef = useRef<Animation | null>(null);

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;

    if (!active) {
      // Сброс после перехода
      el.style.transform = "";
      el.style.transformOrigin = "";
      el.style.transition = "";
      el.style.filter = "";
      return;
    }

    const cx = flowerPos?.x ?? window.innerWidth / 2;
    const cy = flowerPos?.y ?? window.innerHeight / 2;

    el.style.transformOrigin = `${cx}px ${cy}px`;
    el.style.transition = "transform 2s cubic-bezier(0.25, 0, 0.1, 1), filter 1.8s ease";
    el.style.filter = "blur(0px)";

    // Запускаем через один кадр чтобы transition подхватил
    const raf = requestAnimationFrame(() => {
      el.style.transform = "scale(18)";
      el.style.filter = "blur(8px)";
    });

    return () => cancelAnimationFrame(raf);
  }, [active, flowerPos, pageRef]);

  return null;
}
