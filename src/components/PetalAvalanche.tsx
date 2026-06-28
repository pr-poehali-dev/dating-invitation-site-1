import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  active: boolean;
  onCovered: () => void;
  onDone?: () => void;
}

const COUNT = 1200;
const EMOJIS = ["🌸", "🌸", "🌸", "💮", "🌸", "🌸", "💮", "🌸"];

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  delay: number;
  rotate: number;
  rotateSpeed: number;
  emoji: string;
  started: boolean;
}

export default function PetalAvalanche({ active, onCovered, onDone }: Props) {
  const calledRef = useRef(false);
  const [show, setShow] = useState(false);
  const [fading, setFading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const petalsRef = useRef<Petal[]>([]);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      calledRef.current = false;
      return;
    }

    setShow(true);
    setFading(false);

    const t1 = setTimeout(() => {
      if (!calledRef.current) {
        calledRef.current = true;
        onCovered();
      }
    }, 1400);

    const t2 = setTimeout(() => setFading(true), 2200);

    const t3 = setTimeout(() => {
      setShow(false);
      setFading(false);
      onDone?.();
    }, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [active, onCovered, onDone]);

  useEffect(() => {
    if (!show) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    petalsRef.current = Array.from({ length: COUNT }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: -Math.random() * canvas.height,
      size: 20 + Math.random() * 20,
      speedY: 400 + Math.random() * 300,
      delay: Math.random() * 0.8,
      rotate: Math.random() * Math.PI * 2,
      rotateSpeed: (Math.random() - 0.5) * 4,
      emoji: EMOJIS[i % EMOJIS.length],
      started: false,
    }));

    startTimeRef.current = performance.now();

    const draw = (now: number) => {
      const elapsed = (now - startTimeRef.current) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (const p of petalsRef.current) {
        if (elapsed < p.delay) continue;
        const t = elapsed - p.delay;
        const y = p.y + p.speedY * t;
        const rot = p.rotate + p.rotateSpeed * t;

        ctx.save();
        ctx.font = `${p.size}px serif`;
        ctx.translate(p.x, y % (canvas.height + 60));
        ctx.rotate(rot);
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(rafRef.current);
  }, [show]);

  return createPortal(
    show ? (
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          pointerEvents: "none",
          opacity: fading ? 0 : 1,
          transition: fading ? "opacity 0.8s ease" : "none",
          width: "100%",
          height: "100%",
        }}
      />
    ) : null,
    document.body,
  );
}
