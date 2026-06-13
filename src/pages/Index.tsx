import { useState, useRef, useCallback } from "react";

const HEARTS = ["❤️", "🌸", "💕", "🌷", "💗", "🍓", "🌹", "💝"];

const floatingHearts = Array.from({ length: 18 }, (_, i) => ({
  emoji: HEARTS[i % HEARTS.length],
  left: `${(i * 5.5 + 2) % 100}%`,
  delay: `${(i * 0.45) % 8}s`,
  duration: `${6 + (i * 0.37) % 6}s`,
  size: `${0.8 + (i * 0.13) % 1.2}rem`,
  opacity: 0.25 + (i * 0.04) % 0.4,
}));

function HeartsBackground() {
  return (
    <div className="hearts-bg">
      {floatingHearts.map((h, i) => (
        <span
          key={i}
          className="floating-heart"
          style={{
            left: h.left,
            animationDelay: h.delay,
            animationDuration: h.duration,
            fontSize: h.size,
            opacity: h.opacity,
          }}
        >
          {h.emoji}
        </span>
      ))}
    </div>
  );
}

export default function Index() {
  const [answered, setAnswered] = useState<"yes" | "maybe" | null>(null);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const noRef = useRef<HTMLButtonElement>(null);

  const handleNoHover = useCallback(() => {
    const btn = noRef.current;
    if (!btn) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const OFFSET = 90;

    setNoPos(prev => {
      let nx = prev.x + (Math.random() > 0.5 ? 1 : -1) * (OFFSET * (0.7 + Math.random() * 0.6));
      let ny = prev.y + (Math.random() > 0.5 ? 1 : -1) * (OFFSET * (0.7 + Math.random() * 0.6));
      const maxX = vw / 2 - 80;
      const maxY = vh / 2 - 60;
      nx = Math.max(-maxX, Math.min(maxX, nx));
      ny = Math.max(-maxY, Math.min(maxY, ny));
      return { x: nx, y: ny };
    });
  }, []);

  if (answered === "yes") {
    return (
      <div className="date-page">
        <HeartsBackground />
        <div className="answer-content animate-in">
          <div className="big-emoji">🥰</div>
          <h1 className="answer-title">Я так и знал!</h1>
          <p className="answer-sub">Это будет лучшее свидание в нашей жизни ✨</p>
        </div>
      </div>
    );
  }

  if (answered === "maybe") {
    return (
      <div className="date-page">
        <HeartsBackground />
        <div className="answer-content animate-in">
          <div className="big-emoji">🌸</div>
          <h1 className="answer-title">Я буду ждать...</h1>
          <p className="answer-sub">Сколько угодно — это того стоит 💕</p>
        </div>
      </div>
    );
  }

  return (
    <div className="date-page">
      <HeartsBackground />
      <div className="card-center animate-in">
        <p className="pre-title">у меня есть к тебе вопрос</p>
        <div className="deco-divider">— ♥ —</div>
        <h1 className="main-question">
          Пойдёшь со мной<br />
          <em>на свидание?</em>
        </h1>
        <div className="deco-hearts">💗 &nbsp;&nbsp; 🌹 &nbsp;&nbsp; 💗</div>
        <div className="buttons-row">
          <button className="btn btn-yes" onClick={() => setAnswered("yes")}>
            Да! 💌
          </button>
          <button className="btn btn-maybe" onClick={() => setAnswered("maybe")}>
            Я подумаю 🌸
          </button>
          <button
            ref={noRef}
            className="btn btn-no"
            style={{
              transform: `translate(${noPos.x}px, ${noPos.y}px)`,
              transition: "transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
            onMouseEnter={handleNoHover}
            onTouchStart={handleNoHover}
          >
            Нет
          </button>
        </div>
      </div>
    </div>
  );
}
