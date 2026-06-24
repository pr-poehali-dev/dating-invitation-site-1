import { useEffect, useRef, useState } from "react";

interface Props {
  active: boolean;
  onCovered: () => void;
  onDone?: () => void;
}

const EMOJIS = ["🌸", "🌸", "🌸", "💮", "🌸", "🌸", "💮", "🌸"];
const COUNT = 120;

interface Petal {
  id: number;
  emoji: string;
  left: number;
  size: number;
  fallDuration: number;
  delay: number;
  rotate: number;
  stopAt: number;
}

function generatePetals(): Petal[] {
  return Array.from({ length: COUNT }, (_, i) => ({
    id: i,
    emoji: EMOJIS[i % EMOJIS.length],
    left: Math.random() * 108 - 4,
    size: 2.8 + Math.random() * 3.5,
    fallDuration: 0.6 + Math.random() * 0.7,
    delay: Math.random() * 1.2,
    rotate: Math.random() * 360,
    stopAt: 10 + Math.random() * 80,
  }));
}

export default function PetalAvalanche({ active, onCovered, onDone }: Props) {
  const calledRef = useRef(false);
  const [phase, setPhase] = useState<"idle" | "falling" | "covered" | "leaving">("idle");
  const [petals] = useState<Petal[]>(() => generatePetals());

  useEffect(() => {
    if (!active) {
      calledRef.current = false;
      return;
    }

    setPhase("falling");

    // 1.8с — лепестки заполнили экран, меняем страницу
    const t1 = setTimeout(() => {
      setPhase("covered");
      if (!calledRef.current) {
        calledRef.current = true;
        onCovered();
      }
    }, 1800);

    // 3.0с — лепестки улетают вверх
    const t2 = setTimeout(() => {
      setPhase("leaving");
    }, 3000);

    // 4.0с — анимация закончена
    const t3 = setTimeout(() => {
      setPhase("idle");
      onDone?.();
    }, 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [active, onCovered, onDone]);

  if (phase === "idle") return null;

  return (
    <div className="petal-avalanche">
      {petals.map((p) => (
        <span
          key={p.id}
          className={`avalanche-petal avalanche-petal--${phase}`}
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}rem`,
            "--fall-duration": `${p.fallDuration}s`,
            "--fall-delay": `${p.delay}s`,
            "--rotate": `${p.rotate}deg`,
            "--stop-at": `${p.stopAt}vh`,
          } as React.CSSProperties}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
