import { useState, useRef, useCallback } from "react";

const CAT_IMG = "https://cdn.poehali.dev/projects/cfc5af78-3f02-4c6d-a9b7-cad2708837ac/files/4b365dd2-e73c-45db-858b-95f8c7ab5215.jpg";

const PETALS = ["🌸", "🌸", "🌸", "💮", "🌸", "🌸", "💮", "🌸", "🌸", "🌸", "💮", "🌸", "🌸", "🌸", "💮", "🌸", "🌸", "🌸", "💮", "🌸", "🌸", "💮", "🌸", "🌸", "🌸", "💮", "🌸", "🌸"];

const floatingPetals = PETALS.map((p, i) => ({
  emoji: p,
  left: `${(i * 3.7 + 1.5) % 100}%`,
  delay: `${(i * 0.38) % 7}s`,
  duration: `${5 + (i * 0.29) % 5}s`,
  size: `${1.3 + (i * 0.15) % 1.1}rem`,
  opacity: 0.45 + (i * 0.04) % 0.4,
}));

function ScatteredPetals() {
  return (
    <div className="petals-scatter">
      {floatingPetals.map((p, i) => (
        <span
          key={i}
          className="falling-petal"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            fontSize: p.size,
            opacity: p.opacity,
          }}
        >
          {p.emoji}
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
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const OFFSET = 100;
    setNoPos(prev => {
      let nx = prev.x + (Math.random() > 0.5 ? 1 : -1) * (OFFSET * (0.6 + Math.random() * 0.8));
      let ny = prev.y + (Math.random() > 0.5 ? 1 : -1) * (OFFSET * (0.6 + Math.random() * 0.8));
      const maxX = vw / 2 - 90;
      const maxY = vh / 2 - 60;
      nx = Math.max(-maxX, Math.min(maxX, nx));
      ny = Math.max(-maxY, Math.min(maxY, ny));
      return { x: nx, y: ny };
    });
  }, []);

  if (answered === "yes") {
    return (
      <div className="meme-page">
        <ScatteredPetals />
        <div className="meme-card animate-in">
          <img src={CAT_IMG} alt="котик" className="cat-img" />
          <h1 className="meme-question yes-text">
            🌸 Ура!! Ты лучшая! 🌸
          </h1>
          <p className="meme-sub">это будет лучшее свидание 💝</p>
        </div>
      </div>
    );
  }

  if (answered === "maybe") {
    return (
      <div className="meme-page">
        <ScatteredPetals />
        <div className="meme-card animate-in">
          <img src={CAT_IMG} alt="котик" className="cat-img" />
          <h1 className="meme-question" style={{ color: "#a07cc5" }}>
            🤔 Буду ждать... 🤔
          </h1>
          <p className="meme-sub">главное, что ты думаешь об этом 💜</p>
        </div>
      </div>
    );
  }

  return (
    <div className="meme-page">
      <ScatteredPetals />
      <div className="meme-card animate-in">
        <img src={CAT_IMG} alt="котик" className="cat-img" />
        <h1 className="meme-question">
          🌸 Пойдёшь со мной на свидание? 🌸
        </h1>
        <div className="meme-buttons">
          <button className="bubble-btn bubble-yes" onClick={() => setAnswered("yes")}>
            Да ✔️
          </button>
          <button className="bubble-btn bubble-maybe" onClick={() => setAnswered("maybe")}>
            я подумаю 🤔
          </button>
          <button
            ref={noRef}
            className="bubble-btn bubble-no"
            style={{
              transform: `translate(${noPos.x}px, ${noPos.y}px)`,
              transition: "transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
            onMouseEnter={handleNoHover}
            onTouchStart={handleNoHover}
          >
            нет ❌
          </button>
        </div>
      </div>
    </div>
  );
}