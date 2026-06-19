import { useEffect, useRef } from "react";

interface Props {
  active: boolean;
  onCovered: () => void; // когда лепестки заполнили экран
}

const EMOJIS = ["🌸", "🌸", "🌸", "💮", "🌸", "🌸", "💮", "🌸"];
const COUNT = 80;

export default function PetalAvalanche({ active, onCovered }: Props) {
  const calledRef = useRef(false);

  useEffect(() => {
    if (!active) {
      calledRef.current = false;
      return;
    }
    // Через 1.5с экран заполнен — делаем переход
    const t = setTimeout(() => {
      if (!calledRef.current) {
        calledRef.current = true;
        onCovered();
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [active, onCovered]);

  if (!active) return null;

  return (
    <div className="petal-avalanche">
      {Array.from({ length: COUNT }, (_, i) => {
        const emoji = EMOJIS[i % EMOJIS.length];
        const left = Math.random() * 110 - 5;
        const size = 2.5 + Math.random() * 3.5;
        const duration = 0.8 + Math.random() * 0.8;
        const delay = Math.random() * 0.8;
        const rotate = Math.random() * 360;
        return (
          <span
            key={i}
            className="avalanche-petal"
            style={{
              left: `${left}%`,
              fontSize: `${size}rem`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              "--rotate": `${rotate}deg`,
            } as React.CSSProperties}
          >
            {emoji}
          </span>
        );
      })}
    </div>
  );
}
