import { useState, useRef, useCallback } from "react";

const CAT_IMG = "https://cdn.poehali.dev/projects/cfc5af78-3f02-4c6d-a9b7-cad2708837ac/files/4b365dd2-e73c-45db-858b-95f8c7ab5215.jpg";

const PETALS = ["🌸", "🌸", "💮", "🌸", "🌸", "🌸", "💮", "🌸", "🌸", "💮", "🌸", "🌸"];

const floatingPetals = PETALS.map((p, i) => ({
  emoji: p,
  left: `${(i * 8.3 + 1) % 100}%`,
  top: `${(i * 13 + 5) % 90}%`,
  size: `${0.6 + (i * 0.11) % 0.7}rem`,
  opacity: 0.3 + (i * 0.06) % 0.5,
  rotate: `${(i * 37) % 360}deg`,
}));

function ScatteredPetals() {
  return (
    <div className="petals-scatter">
      {floatingPetals.map((p, i) => (
        <span
          key={i}
          className="scatter-petal"
          style={{
            left: p.left,
            top: p.top,
            fontSize: p.size,
            opacity: p.opacity,
            transform: `rotate(${p.rotate})`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

export default function Index() {
  const [answered, setAnswered] = useState<"yes" | null>(null);
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
            нет... 🙈
          </button>
        </div>
      </div>
    </div>
  );
}
