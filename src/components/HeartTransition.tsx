import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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

// Контур сердца в нормализованных координатах (центр 0,0), диапазон ~[-1..1]
// Параметрически: x = 16 sin^3 t, y = 13 cos t - 5 cos2t - 2 cos3t - cos4t
const HEART_POINTS: Array<[number, number]> = (() => {
  const pts: Array<[number, number]> = [];
  const N = 60;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    pts.push([x / 16, -y / 16]); // нормируем и переворачиваем Y (экран вниз)
  }
  return pts;
})();

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

  // Центр сердца в px, синхронно с эмодзи
  const cx = (heartCenterVw / 100) * dims.w;
  const cy = dims.h / 2;
  // Радиус сердца в px (эмодзи ~90vh по высоте, полувысота ~ 0.45 * h)
  const r = dims.h * 0.45;
  const rad = (rotate * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);

  // Контур сердца в пикселях экрана с учётом позиции и вращения
  const heartPoly = HEART_POINTS.map(([nx, ny]) => {
    const px = nx * r;
    const py = ny * r;
    const rx = px * cosA - py * sinA + cx;
    const ry = px * sinA + py * cosA + cy;
    return `${rx.toFixed(1)}px ${ry.toFixed(1)}px`;
  }).join(", ");

  // Клип финального экрана — внутри контура сердца
  const finalClip = `polygon(${heartPoly})`;
  // Клип DatePicker — снаружи сердца (весь экран минус сердце, evenodd)
  const dateClip =
    `path(evenodd, "M0 0H${dims.w}V${dims.h}H0Z ` +
    HEART_POINTS.map(([nx, ny], i) => {
      const px = nx * r;
      const py = ny * r;
      const rx = px * cosA - py * sinA + cx;
      const ry = px * sinA + py * cosA + cy;
      return `${i === 0 ? "M" : "L"}${rx.toFixed(1)} ${ry.toFixed(1)}`;
    }).join(" ") +
    'Z")';

  return createPortal(
    <>
      {/* DatePicker — виден снаружи сердца */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99996,
          clipPath: dateClip,
          overflow: "hidden",
          pointerEvents: "none",
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
          clipPath: finalClip,
          overflow: "hidden",
          pointerEvents: "none",
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