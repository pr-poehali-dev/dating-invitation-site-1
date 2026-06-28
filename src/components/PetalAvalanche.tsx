import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  active: boolean;
  onCovered: () => void;
  onDone?: () => void;
}

const EMOJIS = ["🌸", "🌸", "🌸", "💮", "🌸", "🌸", "💮", "🌸"];
const COUNT = 1200;

interface Petal {
  id: number;
  emoji: string;
  left: number;
  size: number;
  fallDuration: number;
  delay: number;
  rotate: number;
}

const PETALS: Petal[] = Array.from({ length: COUNT }, (_, i) => ({
  id: i,
  emoji: EMOJIS[i % EMOJIS.length],
  left: Math.random() * 110 - 5,
  size: 3.5 + Math.random() * 4.5,
  fallDuration: 0.6 + Math.random() * 0.4,
  delay: Math.random() * 0.8,
  rotate: Math.random() * 360,
}));

export default function PetalAvalanche({ active, onCovered, onDone }: Props) {
  const calledRef = useRef(false);
  const [show, setShow] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!active) {
      calledRef.current = false;
      return;
    }

    setShow(true);
    setFading(false);

    // 1.4с — экран закрыт, меняем страницу
    const t1 = setTimeout(() => {
      if (!calledRef.current) {
        calledRef.current = true;
        onCovered();
      }
    }, 1400);

    // 2.2с — плавно растворяем
    const t2 = setTimeout(() => setFading(true), 2200);

    // 3.0с — убираем
    const t3 = setTimeout(() => {
      setShow(false);
      setFading(false);
      onDone?.();
    }, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [active, onCovered, onDone]);

  return createPortal(
      <div
        style={{
          position: "fixed",
          inset: 0, 
          zIndex: 9999,
          pointerEvents: "none",
          overflow: "hidden",
          opacity: fading ? 0 : show ? 1 : 0,
          visibilit: show ? "visible" : "hidden",
          transition: fading ? "opacity 0.8s ease" : "none",
        }}
      >
        {PETALS.map((p) => (
          <span
            key={p.id}  
            style={
              {
                position: "absolute",
                top: 0,
                left: `${p.left}%`,
                fontSize: `${p.size}rem`,
                userSelect: "none",
                animation: show
                ? `avalancheFalling ${p.fallDuration}
s linear ${p.delay}s infinite backwards`
:"none",
"--rotate": `${p.rotate}deg`,
} as React.CSSProperties
            }
          >
            {p.emoji}
          </span>
        ))}
      </div>
    document.body,
  );
}