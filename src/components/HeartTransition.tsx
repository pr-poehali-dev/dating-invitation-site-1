import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface Props {
  onDone: () => void;
}

export default function HeartTransition({ onDone }: Props) {
  const doneRef = useRef(false);

  useEffect(() => {
    // Переход на финальный экран в середине анимации — когда сердце закрыло экран
    const t1 = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone();
      }
    }, 1200);

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
          transform: "translateY(-50%)",
          fontSize: "min(100vw, 100vh)",
          lineHeight: 1,
          animation: "heartRoll 2.4s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        }}
      >
        ❤️
      </div>
      <style>{`
        @keyframes heartRoll {
          0%   { transform: translateY(-50%) translateX(-110%) rotate(0deg); opacity: 1; }
          50%  { transform: translateY(-50%) translateX(0%)   rotate(-360deg); opacity: 1; }
          75%  { transform: translateY(-50%) translateX(0%)   rotate(-360deg); opacity: 1; }
          100% { transform: translateY(-50%) translateX(110%) rotate(-720deg); opacity: 1; }
        }
      `}</style>
    </div>,
    document.body,
  );
}
