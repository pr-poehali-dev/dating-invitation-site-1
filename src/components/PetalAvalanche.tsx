import { useEffect, useRef, useState } from "react";

interface Props {
  active: boolean;
  onCovered: () => void;
  onDone?: () => void;
}

const EMOJIS = ["🌸", "🌸", "🌸", "💮", "🌸", "🌸", "💮", "🌸"];
const COUNT = 400;

interface Petal {
  id: number;
  emoji: string;
  left: number;
  size: number;
  fallDuration: number;
  delay: number;
  rotate: number;
}

function generatePetals(): Petal[] {
  return Array.from({ length: COUNT }, (_, i) => ({
    id: i,
    emoji: EMOJIS[i % EMOJIS.length],
    left: Math.random() * 110 - 5,
    size: 3.5 + Math.random() * 4.5,
    fallDuration: 0.6 + Math.random() * 0.4,
    delay: -(Math.random() * 1.2), // отрицательный — уже в полёте при старте
    rotate: Math.random() * 360,
  }));
}

export default function PetalAvalanche({ active, onCovered, onDone }: Props) {
  const calledRef = useRef(false);
  const [phase, setPhase] = useState<"idle" | "falling" | "fading">("idle");
  const [petals] = useState<Petal[]>(() => generatePetals());

  useEffect(() => {
    if (!active) {
      calledRef.current = false;
      return;
    }

    setPhase("falling");

    // 600мс — лепестки уже заполнили экран (infinite + отриц. delay), меняем страницу
    const t1 = setTimeout(() => {
      if (!calledRef.current) {
        calledRef.current = true;
        onCovered();
      }
    }, 600);

    // 1.6с — лепестки плавно растворяются, пользователь уже на странице 2
    const t2 = setTimeout(() => {
      setPhase("fading");
    }, 1600);

    // 2.4с — убираем компонент
    const t3 = setTimeout(() => {
      setPhase("idle");
      onDone?.();
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [active, onCovered, onDone]);

  if (phase === "idle") return null;

  return (
    <div
      className="petal-avalanche"
      style={
        phase === "fading"
          ? { opacity: 0, transition: "opacity 0.8s ease" }
          : { opacity: 1 }
      }
    >
      {petals.map((p) => (
        <span
          key={p.id}
          className="avalanche-petal avalanche-petal--falling"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}rem`,
            "--fall-duration": `${p.fallDuration}s`,
            "--fall-delay": `${p.delay}s`,
            "--rotate": `${p.rotate}deg`,
          } as React.CSSProperties}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}