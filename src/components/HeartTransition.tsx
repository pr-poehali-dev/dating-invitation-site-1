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

export default function HeartTransition({ onDone, finalContent, datepickerContent }: Props) {
  const doneRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

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
  // Граница "стёртого": правый край сердца
  const revealedVw = heartCenterVw + HEART_HALF_VW;
  // Угол вращения по часовой стрелке: 540deg за весь путь
  const rotate = progress * 540;

  return createPortal(
    <>
      {/* DatePicker — виден справа от сердца */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99996,
          clipPath: `inset(0 0 0 ${Math.max(0, revealedVw)}vw)`,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {datepickerContent}
      </div>

      {/* Финальный экран — открывается слева от сердца */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99997,
          clipPath: `inset(0 ${Math.max(0, 100 - revealedVw)}vw 0 0)`,
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
