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

// SVG path сердца в координатах 0..1 (центр 0.5, 0.5)
// Нормализованный path для сердца
const HEART_PATH = "M 0.5 0.85 C 0.5 0.85 0.05 0.55 0.05 0.35 C 0.05 0.15 0.2 0.05 0.35 0.1 C 0.42 0.12 0.48 0.18 0.5 0.25 C 0.52 0.18 0.58 0.12 0.65 0.1 C 0.8 0.05 0.95 0.15 0.95 0.35 C 0.95 0.55 0.5 0.85 0.5 0.85 Z";

export default function HeartTransition({ onDone, finalContent, datepickerContent }: Props) {
  const doneRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const [vw, setVw] = useState(window.innerWidth);
  const [vh, setVh] = useState(window.innerHeight);

  useEffect(() => {
    const onResize = () => { setVw(window.innerWidth); setVh(window.innerHeight); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const animate = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const p = Math.min((now - startRef.current) / DURATION, 1);
      setProgress(p);
      if (p >= 1) {
        if (!doneRef.current) { doneRef.current = true; onDone(); }
        return;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onDone]);

  // Центр сердца в пикселях
  const heartCenterVw = -HEART_HALF_VW + progress * (100 + HEART_HALF_VW * 2);
  const cx = (heartCenterVw / 100) * vw; // px
  const cy = vh / 2;
  const rotate = progress * 540;

  // Размер сердца в px (90vh)
  const heartPx = vh * 0.9;

  // SVG clipPath: сердце в нужной позиции с вращением
  // transform-origin — центр сердца
  const clipId = "heart-clip-final";
  const clipId2 = "heart-clip-date";

  // scale сердца: path нормализован 0..1, умножаем на heartPx
  const s = heartPx;
  // левый верхний угол сердца чтобы центр оказался в cx,cy
  const hx = cx - s * 0.5;
  const hy = cy - s * 0.5;

  const heartTransform = `translate(${hx} ${hy}) scale(${s}) rotate(${rotate} 0.5 0.5)`;

  return createPortal(
    <>
      {/* SVG с двумя clipPath — один для финального (внутри сердца), один для datepicker (снаружи) */}
      <svg
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 99994, pointerEvents: "none" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id={clipId}>
            <path d={HEART_PATH} transform={heartTransform} />
          </clipPath>
          <clipPath id={clipId2}>
            {/* Всё кроме сердца: большой прямоугольник минус сердце через evenodd */}
            <path
              fillRule="evenodd"
              d={`M -9999 -9999 L 99999 -9999 L 99999 99999 L -9999 99999 Z ${HEART_PATH}`}
              transform={heartTransform}
            />
          </clipPath>
        </defs>
      </svg>

      {/* DatePicker — виден снаружи сердца (справа) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99996,
          pointerEvents: "none",
          clipPath: `url(#${clipId2})`,
        }}
      >
        {datepickerContent}
      </div>

      {/* Финальный экран — виден внутри сердца */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99997,
          pointerEvents: "none",
          clipPath: `url(#${clipId})`,
        }}
      >
        {finalContent}
      </div>

      {/* Само сердце-эмодзи поверх */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            fontSize: HEART_SIZE,
            lineHeight: 1,
            whiteSpace: "nowrap",
            transform: `translateY(-50%) translateX(${heartCenterVw - HEART_HALF_VW}vw) rotate(${rotate}deg)`,
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
