import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  onDone: () => void;
  finalContent: React.ReactNode;
  datepickerContent: React.ReactNode;
}

const DURATION = 5000;
const HEART_SIZE = "90vh";
const HEART_HALF_VW = 45;

// Контур сердца в нормализованных координатах (центр 0,0), диапазон ~[-1..1]
const HEART_POINTS: Array<[number, number]> = (() => {
  const pts: Array<[number, number]> = [];
  const N = 60;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    pts.push([x / 16, -y / 16]);
  }
  return pts;
})();

export default function HeartTransition({ onDone, finalContent, datepickerContent }: Props) {
  const doneRef = useRef(false);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [maskUrl, setMaskUrl] = useState<string>("");

  // Canvas, на котором накапливается след сердца (НЕ очищается между кадрами)
  const trailRef = useRef<HTMLCanvasElement | null>(null);
  // Позиция эмодзи для рендера
  const [emoji, setEmoji] = useState({ x: -HEART_HALF_VW, rot: 0 });

  useEffect(() => {
    const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Инициализируем canvas следа при изменении размеров
  useEffect(() => {
    const c = document.createElement("canvas");
    c.width = dims.w;
    c.height = dims.h;
    trailRef.current = c;
  }, [dims.w, dims.h]);

  useEffect(() => {
    const animate = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const p = Math.min((now - startRef.current) / DURATION, 1);

      const heartCenterVw = -HEART_HALF_VW + p * (100 + HEART_HALF_VW * 2);
      const rotate = p * 540;
      setEmoji({ x: heartCenterVw, rot: rotate });

      // Рисуем сердце на canvas следа (накопление, без очистки)
      const c = trailRef.current;
      if (c) {
        const ctx = c.getContext("2d");
        if (ctx) {
          // Точный центр глифа ❤️, как он реально отрисован эмодзи:
          // div: left:0, translateX((x-45)vw); внутри em-бокс шрифта 90vh.
          // Левый край текста:
          const textLeftPx = ((heartCenterVw - HEART_HALF_VW) / 100) * dims.w;
          const fontPx = dims.h * 0.9; // font-size 90vh
          // Глиф ❤️ внутри em-бокса: горизонтальный центр ~0.5em, вертикальный ~0.55em от верха строки
          const cx = textLeftPx + 0.5 * fontPx;
          const cy = dims.h / 2;
          // Радиус красного сердца внутри глифа ~0.41 от font-size
          const r = fontPx * 0.41;
          const rad = (rotate * Math.PI) / 180;
          const cosA = Math.cos(rad);
          const sinA = Math.sin(rad);

          ctx.beginPath();
          HEART_POINTS.forEach(([nx, ny], i) => {
            const px = nx * r;
            const py = ny * r;
            const x = px * cosA - py * sinA + cx;
            const y = px * sinA + py * cosA + cy;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.closePath();
          ctx.fillStyle = "#000";
          ctx.fill();

          setMaskUrl(c.toDataURL());
        }
      }

      if (p >= 1) {
        if (!doneRef.current) {
          doneRef.current = true;
          onDone();
        }
        return;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onDone, dims.w, dims.h]);

  return createPortal(
    <>
      {/* DatePicker — везде, КРОМЕ области, которую уже прошло сердце (инверсия маски) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99996,
          pointerEvents: "none",
          maskImage: maskUrl ? `url(${maskUrl})` : undefined,
          WebkitMaskImage: maskUrl ? `url(${maskUrl})` : undefined,
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
          maskMode: "luminance",
          WebkitMaskComposite: "destination-out",
          maskComposite: "subtract",
        }}
      >
        {datepickerContent}
      </div>

      {/* Финальный экран — виден там, где прошло сердце (по маске-следу) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99997,
          pointerEvents: "none",
          maskImage: maskUrl ? `url(${maskUrl})` : undefined,
          WebkitMaskImage: maskUrl ? `url(${maskUrl})` : undefined,
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
        }}
      >
        {finalContent}
      </div>

      {/* Само сердце */}
      <div style={{ position: "fixed", inset: 0, zIndex: 99999, pointerEvents: "none", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            fontSize: HEART_SIZE,
            lineHeight: 1,
            whiteSpace: "nowrap",
            transform: `translateY(-50%) translateX(${emoji.x - HEART_HALF_VW}vw) rotate(${emoji.rot}deg)`,
            filter: "drop-shadow(0 0 30px rgba(255,80,120,0.4))",
          }}
        >
          ❤️
        </div>
      </div>
    </>,
    document.body,
  );
}