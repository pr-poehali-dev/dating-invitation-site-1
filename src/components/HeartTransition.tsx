import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  onDone: () => void;
  finalContent: React.ReactNode;
}

const DURATION = 5000;
const HEART_VW = 130; // ширина сердца в vw

export default function HeartTransition({ onDone, finalContent }: Props) {
  const doneRef = useRef(false);
  const [progress, setProgress] = useState(0); // 0..1
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

  // Центр сердца движется от -HEART_VW vw до (100 + HEART_VW) vw
  const heartCenterVw = -HEART_VW + progress * (100 + HEART_VW * 2);
  // Правая граница сердца — то что уже "открыто" слева
  const revealedVw = heartCenterVw + HEART_VW * 0.35;

  return createPortal(
    <>
      {/* Финальный экран — открывается слева по мере движения сердца */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99997,
          clipPath: `inset(0 ${Math.max(0, 100 - revealedVw)}vw 0 0)`,
          overflow: "hidden",
        }}
      >
        {finalContent}
      </div>

      {/* Розовый overlay — "старый экран", закрывает правую часть */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99998,
          background: "linear-gradient(135deg, #fff0f5 0%, #fce4ec 100%)",
          clipPath: `inset(0 0 0 ${Math.max(0, revealedVw)}vw)`,
        }}
      />

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
            fontSize: `${HEART_VW * 0.9}vw`,
            lineHeight: 1,
            whiteSpace: "nowrap",
            transform: `translateY(-50%) translateX(${heartCenterVw - HEART_VW * 0.45}vw)`,
            filter: "drop-shadow(0 0 40px rgba(255,80,120,0.5))",
          }}
        >
          ❤️
        </div>
      </div>
    </>,
    document.body,
  );
}
