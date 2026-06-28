import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// SVG path сердца, viewBox 0 0 100 100, визуальный центр ~(50, 50)
const HEART_PATH = "M50 88 C50 88 8 60 8 34 C8 17 20 7 35 12 C42 15 47 21 50 27 C53 21 58 15 65 12 C80 7 92 17 92 34 C92 60 50 88 50 88 Z";

interface Props {
  onDone: () => void;
  finalContent: React.ReactNode;
  datepickerContent: React.ReactNode;
}

const DURATION = 5000;
// Сердце ~90vh как в версии fix: heart loader transition mask
// Эмодзи занимает ~75% от font-size по ширине, поэтому берём 90vh / 0.75 ~ 120vh для перекрытия
const HEART_SIZE = "90vh";
// Ширина сердца в vw для расчёта границы (приблизительно)
const HEART_HALF_VW = 45;

export default function HeartTransition({ onDone, finalContent, datepickerContent }: Props) {
  const doneRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const animate = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const p = Math.min((now - startRef.current) / DURATION, 1);
      setProgress(p);

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
  }, [onDone]);

  // Центр сердца движется от -50vw до 150vw
  const heartCenterVw = -HEART_HALF_VW + progress * (100 + HEART_HALF_VW * 2);
  // Угол вращения по часовой стрелке: 540deg за весь путь
  const rotate = progress * 540;

  // Позиция центра сердца в px — синхронно с эмодзи
  const cx = (heartCenterVw / 100) * dims.w;
  const cy = dims.h / 2;
  // Размер сердца в px: font-size = 90vh, эмодзи ~= font-size
  const heartPx = dims.h * 0.9;
  const scale = heartPx / 100;
  // SVG path нормализован 0..100, визуальный центр (50, 50)
  const t = `translate(${cx} ${cy}) rotate(${rotate}) scale(${scale}) translate(-50 -50)`;

  return createPortal(
    <>
      {/* SVG с клипами в форме сердца */}
      <svg style={{ position: "fixed", width: 0, height: 0, overflow: "visible" }}>
        <defs>
          {/* Финальный экран: внутри сердца */}
          <clipPath id="ht-final" clipPathUnits="userSpaceOnUse">
            <path d={HEART_PATH} transform={t} />
          </clipPath>
          {/* DatePicker: снаружи сердца (весь экран минус сердце) */}
          <clipPath id="ht-date" clipPathUnits="userSpaceOnUse">
            <path
              fillRule="evenodd"
              d={`M-9999-9999 H99999 V99999 H-9999Z M${HEART_PATH}`}
              transform={t}
            />
          </clipPath>
        </defs>
      </svg>

      {/* DatePicker — виден снаружи сердца */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99996,
          pointerEvents: "none",
          clipPath: "url(#ht-date)",
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
          clipPath: "url(#ht-final)",
        }}
      >
        {finalContent}
      </div>

      {/* Само сердце */}
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