import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  onDone: () => void;
  finalContent: React.ReactNode;
  datepickerContent: React.ReactNode;
}

const DURATION = 5000;

// Рисует путь сердца в текущем контексте. Координаты в "единицах" (~[-8..11]).
function tracePath(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.moveTo(0, 11 * s);
  ctx.bezierCurveTo(-2 * s, 6 * s, -8 * s, 2 * s, -8 * s, -3 * s);
  ctx.bezierCurveTo(-8 * s, -8 * s, -4 * s, -10 * s, 0, -5 * s);
  ctx.bezierCurveTo(4 * s, -10 * s, 8 * s, -8 * s, 8 * s, -3 * s);
  ctx.bezierCurveTo(8 * s, 2 * s, 2 * s, 6 * s, 0, 11 * s);
  ctx.closePath();
}

// Создаёт PNG-силуэт сердца ОДИН раз заданным цветом. Маска и красное сердце
// используют ОДИН И ТОТ ЖЕ силуэт → форма совпадает на 100%.
function makeHeartStamp(size: number, color: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.translate(size / 2, size / 2);
  tracePath(ctx, size / 32);
  ctx.fillStyle = color;
  ctx.fill();
  return c;
}

export default function HeartTransition({ onDone, finalContent, datepickerContent }: Props) {
  const doneRef = useRef(false);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [maskUrl, setMaskUrl] = useState<string>("");
  // Красное сердце как картинка — РОВНО та же форма, что и маска-след.
  const [redUrl, setRedUrl] = useState<string>("");
  const [stampSize, setStampSize] = useState(0);

  // Canvas, на котором накапливается след сердца (НЕ очищается между кадрами)
  const trailRef = useRef<HTMLCanvasElement | null>(null);
  // Готовый PNG-силуэт сердца (рисуется ОДИН раз, форма всегда идентична)
  const stampRef = useRef<HTMLCanvasElement | null>(null);
  // Позиция сердца для рендера (x — центр в пикселях)
  const [emoji, setEmoji] = useState({ x: -9999, rot: 0 });

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
    const size = Math.ceil(dims.h * 0.9 * 1.45);
    stampRef.current = makeHeartStamp(size, "#000");
    setStampSize(size);
    // Красное сердце — тот же силуэт, залитый красным.
    setRedUrl(makeHeartStamp(size, "#e8232e").toDataURL());
  }, [dims.w, dims.h]);

  useEffect(() => {
    const animate = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const p = Math.min((now - startRef.current) / DURATION, 1);

      // Центр сердца проходит экран слева направо (с запасом за края).
      const cx = -dims.w * 0.25 + p * (dims.w * 1.5);
      const cy = dims.h / 2;
      const rotate = p * 540;
      setEmoji({ x: cx, rot: rotate });

      // Рисуем сердце на canvas следа (накопление, без очистки)
      const c = trailRef.current;
      const stamp = stampRef.current;
      if (c && stamp) {
        const ctx = c.getContext("2d");
        if (ctx) {
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

      {/* Само сердце — ТА ЖЕ форма, что и маска-след (один силуэт) */}
      <div style={{ position: "fixed", inset: 0, zIndex: 99999, pointerEvents: "none", overflow: "hidden" }}>
        {redUrl && stampSize > 0 && (
          <img
            src={redUrl}
            alt=""
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              width: stampSize,
              height: stampSize,
              transform: `translate(-50%, -50%) translateX(${emoji.x}px) rotate(${emoji.rot}deg)`,
              filter: "drop-shadow(0 0 30px rgba(255,80,120,0.4))",
            }}
          />
        )}
      </div>
    </>,
    document.body,
  );
}