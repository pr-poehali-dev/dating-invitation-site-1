import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface Props {
  onDone: () => void;
}

const DURATION = 6000;

export default function HeartTransition({ onDone }: Props) {
  const doneRef = useRef(false);

  useEffect(() => {
    // Вызываем onDone в середине пути — сердце точно перекрывает весь экран
    const t1 = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone();
      }
    }, DURATION / 2);

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
          left: 0,
          fontSize: "150vw",
          lineHeight: 1,
          whiteSpace: "nowrap",
          animation: `heartRoll ${DURATION}ms linear forwards`,
        }}
      >
        ❤️
      </div>
      <style>{`
        @keyframes heartRoll {
          0%   { transform: translateY(-50%) translateX(-150vw) rotate(0deg); }
          100% { transform: translateY(-50%) translateX(150vw)  rotate(720deg); }
        }
      `}</style>
    </div>,
    document.body,
  );
}
