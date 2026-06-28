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
  // Граница "стёртого" — строго по центру сердца (как в рабочей версии)
  const revealedVw = heartCenterVw;
  // Угол вращения по часовой стрелке: 540deg за весь путь
  const rotate = progress * 540;

  // Центр сердца в px, синхронно с эмодзи.
  // Реальное красное сердце эмодзи меньше своего бокса (~0.72 от font-size)
  // и слегка смещено вверх внутри строки.
  const cx = (heartCenterVw / 100) * dims.w;
  const cy = dims.h / 2 - dims.h * 0.02;
  // Радиус маски подгоняем под видимое красное сердце (меньше бокса)
  const r = dims.h * 0.45 * 0.72;
  const rad = (rotate * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);
  // Граница раздела в px (вертикальная линия по центру сердца)
  const edgeX = (revealedVw / 100) * dims.w;

  // Точки контура сердца в px (с учётом позиции и вращения)
  const heartPx = HEART_POINTS.map(([nx, ny]) => {
    const px = nx * r;
    const py = ny * r;
    return [px * cosA - py * sinA + cx, px * sinA + py * cosA + cy] as [number, number];
  });
  const heartPathD = heartPx
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ") + "Z";

  // Финальный экран: левая полуплоскость (до edgeX) ОБЪЕДИНЁННАЯ с сердцем.
  // nonzero fill: оба контура по часовой → объединение.
  const W = dims.w;
  const H = dims.h;
  const finalClip = `path(nonzero, "M0 0 L${edgeX.toFixed(1)} 0 L${edgeX.toFixed(1)} ${H} L0 ${H}Z ${heartPathD}")`;
  // DatePicker: правая полуплоскость (от edgeX) МИНУС сердце.
  // evenodd: прямоугольник справа, минус перекрытие с сердцем.
  const dateClip = `path(evenodd, "M${edgeX.toFixed(1)} 0 L${W} 0 L${W} ${H} L${edgeX.toFixed(1)} ${H}Z ${heartPathD}")`;

  return createPortal(
    <>
      {/* DatePicker — справа от границы, минус область сердца */}
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

      {/* Финальный экран — слева от границы, плюс область сердца */}
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