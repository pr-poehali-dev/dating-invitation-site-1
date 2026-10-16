import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  active: boolean;
  onCovered: () => void;
  onDone?: () => void;
}

const EMOJIS = ["🌸", "🌸", "🌸", "💮", "🌸", "🌸", "💮", "🌸"];
const COUNT = 1200;
const SPRITE_PX = 160;

interface Petal {
  emoji: number;
  left: number;
  size: number;
  fallDuration: number;
  delay: number;
  rotate: number;
}

const UNIQUE = Array.from(new Set(EMOJIS));

const PETALS: Petal[] = Array.from({ length: COUNT }, (_, i) => ({
  emoji: UNIQUE.indexOf(EMOJIS[i % EMOJIS.length]),
  left: Math.random() * 110 - 5,
  size: 3.5 + Math.random() * 4.5,
  fallDuration: 0.6 + Math.random() * 0.4,
  delay: Math.random() * 0.8,
  rotate: Math.random() * 360,
}));

function makeSprite(emoji: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = SPRITE_PX;
  c.height = SPRITE_PX;
  const ctx = c.getContext("2d")!;
  ctx.font = `${SPRITE_PX * 0.8}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, SPRITE_PX / 2, SPRITE_PX / 2 + SPRITE_PX * 0.05);
  return c;
}

export default function PetalAvalanche({ active, onCovered, onDone }: Props) {
  const calledRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spritesRef = useRef<HTMLCanvasElement[] | null>(null);
  const [show, setShow] = useState(false);
  const [fading, setFading] = useState(false);

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
    if (!show) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!spritesRef.current) spritesRef.current = UNIQUE.map(makeSprite);
    const sprites = spritesRef.current;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const ctx = canvas.getContext("2d")!;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    let raf = 0;
    const start = performance.now();

    const draw = (now: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const t = (now - start) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      for (const p of PETALS) {
        if (t < p.delay) continue;
        const prog = ((t - p.delay) % p.fallDuration) / p.fallDuration;
        const fontPx = p.size * rem;
        const y = -200 + prog * (h * 1.1 + 200);
        if (y > h + fontPx) continue;
        const x = (p.left / 100) * w;
        const rot = ((p.rotate + prog * 540) * Math.PI) / 180;
        const cx = x + fontPx * 0.5;
        const cy = y + fontPx * 0.6;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.drawImage(sprites[p.emoji], -fontPx / 2, -fontPx / 2, fontPx, fontPx);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [show]);

  return createPortal(
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        pointerEvents: "none",
        opacity: fading ? 0 : show ? 1 : 0,
        visibility: show ? "visible" : "hidden",
        transition: fading ? "opacity 0.8s ease" : "none",
      }}
    />,
    document.body,
  );
}
