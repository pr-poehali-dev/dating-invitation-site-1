import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface Props {
  onDone: () => void;
}

export default function HeartTransition({ onDone }: Props) {
  const doneRef = useRef(false);

  useEffect(() => {
    // Переключаем экран когда сердце в центре (закрывает всё)
    const t1 = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone();
      }
    }, 2500);

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
          // 160vmax — гарантированно больше любого края экрана
          fontSize: "160vmax",
          lineHeight: 1,
          animation: "heartRoll 5s cubic-bezier(0.3, 0, 0.7, 1) forwards",
        }}
      >
        ❤️
      </div>
      <style>{`
        @keyframes heartRoll {
          0%   { transform: translateY(-50%) translateX(-110%) rotate(0deg); }
          45%  { transform: translateY(-50%) translateX(-50%) rotate(-180deg); }
          55%  { transform: translateY(-50%) translateX(-50%) rotate(-180deg); }
          100% { transform: translateY(-50%) translateX(10%)  rotate(-360deg); }
        }
      `}</style>
    </div>,
    document.body,
  );
}
