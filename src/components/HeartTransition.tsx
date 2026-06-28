import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface Props {
  onDone: () => void;
}

export default function HeartTransition({ onDone }: Props) {
  const doneRef = useRef(false);

  useEffect(() => {
    // Убираем сердце после завершения анимации
    const t1 = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone();
      }
    }, 3500);

    return () => clearTimeout(t1);
  }, [onDone]);

  return createPortal(
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
          fontSize: "90vh",
          lineHeight: 1,
          whiteSpace: "nowrap",
          animation: "heartRoll 3.5s linear forwards",
        }}
      >
        ♥️
      </div>
      <style>{`
        @keyframes heartRoll {
          0%   { transform: translateY(-50%) translateX(-100vh) rotate(0deg); }
          100% { transform: translateY(-50%) translateX(110vw)  rotate(540deg); }
        }
      `}</style>
    </div>,
    document.body,
  );
}
