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

export default function HeartTransition({ onDone, finalContent, datepickerContent }: Props) {
  const doneRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const [dims, setDims] = useState({ vw: window.innerWidth, vh: window.innerHeight });

  useEffect(() => {
    const onResize = () => setDims({ vw: window.innerWidth, vh: window.innerHeight });
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

  const heartCenterVw = -HEART_HALF_VW + progress * (100 + HEART_HALF_VW * 2);
  const rotate = progress * 540;

  const heartPx = dims.vh * 0.9;
  const cx = (heartCenterVw / 100) * dims.vw;
  const cy = dims.vh / 2;

  // Path сердца в координатах viewBox 0 0 100 100
  const HEART = "M50,85 C50,85 10,58 10,33 C10,18 20,8 35,13 C42,16 47,22 50,28 C53,22 58,16 65,13 C80,8 90,18 90,33 C90,58 50,85 50,85 Z";

  // Визуальный центр сердца в координатах path (0..100)
  const pathCx = 50;
  const pathCy = 47;
  const scale = heartPx / 100;

  const transform = `translate(${cx} ${cy}) rotate(${rotate}) scale(${scale}) translate(${-pathCx} ${-pathCy})`;

  const clipFinalId = "hclip-final";
  const clipDateId = "hclip-date";

  return createPortal(
    <>
      {/* Скрытый SVG с clipPath-ами */}
      <svg
        style={{ position: "fixed", width: 0, height: 0, overflow: "hidden" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id={clipFinalId} clipPathUnits="userSpaceOnUse">
            <path d={HEART} transform={transform} />
          </clipPath>
          <clipPath id={clipDateId} clipPathUnits="userSpaceOnUse">
            <path fillRule="evenodd" d={`M-9999 -9999 H99999 V99999 H-9999 Z M${HEART}`} transform={transform} />
          </clipPath>
        </defs>
      </svg>

      {/* DatePicker — снаружи сердца */}
      <div style={{ position: "fixed", inset: 0, zIndex: 99996, pointerEvents: "none", clipPath: `url(#${clipDateId})` }}>
        {datepickerContent}
      </div>

      {/* Финальный экран — внутри сердца */}
      <div style={{ position: "fixed", inset: 0, zIndex: 99997, pointerEvents: "none", clipPath: `url(#${clipFinalId})` }}>
        {finalContent}
      </div>

      {/* Эмодзи сердца поверх */}
      <div style={{ position: "fixed", inset: 0, zIndex: 99999, pointerEvents: "none", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            fontSize: HEART_SIZE,
            lineHeight: 1,
            whiteSpace: "nowrap",
            transform: `translateY(-50%) translateX(${heartCenterVw - HEART_HALF_VW}vw) rotate(${rotate}deg)`,
            filter: "drop-shadow(0 0 20px rgba(255,80,120,0.5))",
          }}
        >
          ❤️
        </div>
      </div>
    </>,
    document.body,
  );
}
