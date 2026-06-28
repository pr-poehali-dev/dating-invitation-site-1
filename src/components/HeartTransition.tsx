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

// Создаёт PNG-силуэт сердца ОДИН раз. Форма строится через Безье (как у эмодзи),
// заливается чёрным. Дальше его просто двигаем/поворачиваем — форма всегда идентична.
function makeHeartStamp(size: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.translate(size / 2, size / 2);
  const s = size / 32; // масштаб под систему координат ниже
  ctx.beginPath();
  // Сердце с РАЗДУТЫМИ верхними горбами — чтобы маска гарантированно перекрывала
  // широкий верх эмодзи ❤️ и сверху не оставалось незакрашенной зоны.
  ctx.moveTo(0, 11 * s);
  ctx.bezierCurveTo(-3 * s, 6 * s, -9.5 * s, 2 * s, -9.5 * s, -4 * s);
  ctx.bezierCurveTo(-9.5 * s, -10 * s, -4 * s, -11 * s, 0, -4.5 * s);
  ctx.bezierCurveTo(4 * s, -11 * s, 9.5 * s, -10 * s, 9.5 * s, -4 * s);
  ctx.bezierCurveTo(9.5 * s, 2 * s, 3 * s, 6 * s, 0, 11 * s);
  ctx.closePath();
  ctx.fillStyle = "#000";
  ctx.fill();
  return c;
}

export default function HeartTransition({ onDone, finalContent, datepickerContent }: Props) {
  const doneRef = useRef(false);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [maskUrl, setMaskUrl] = useState<string>("");

  // Canvas, на котором накапливается след сердца (НЕ очищается между кадрами)
  const trailRef = useRef<HTMLCanvasElement | null>(null);
  // Готовый PNG-силуэт сердца (рисуется ОДИН раз, форма всегда идентична)
  const stampRef = useRef<HTMLCanvasElement | null>(null);
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
    // Силуэт-штамп размером с глиф (90vh). Запас по диагонали для поворота.
    const stampSize = Math.ceil(dims.h * 0.9 * 1.45);
    stampRef.current = makeHeartStamp(stampSize);
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
      const stamp = stampRef.current;
      if (c && stamp) {
        const ctx = c.getContext("2d");
        if (ctx) {
          // Центр сердца в тех же координатах, что и красное CSS-сердце.
          const textLeftPx = ((heartCenterVw - HEART_HALF_VW) / 100) * dims.w;
          const fontPx = dims.h * 0.9; // font-size 90vh
          const cx = textLeftPx + 0.5 * fontPx; // центр глифа по X
          const cy = dims.h / 2; // вертикальный центр (translateY(-50%))
          const rad = (rotate * Math.PI) / 180;

          // Готовый силуэт-штамп просто двигаем и поворачиваем — форма всегда идентична.
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(rad);
          ctx.drawImage(stamp, -stamp.width / 2, -stamp.height / 2);
          ctx.restore();

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

      {/* Финальный экран — виден там, где прошло сердце (по маске-следу).
          Рендерится только если передан (старый режим). Когда карточка лежит
          базовым слоем под оверлеем — finalContent не нужен. */}
      {finalContent && (
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
      )}

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