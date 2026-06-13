import { useState, useRef, useCallback } from "react";

const CAT_IMG = "https://cdn.poehali.dev/projects/cfc5af78-3f02-4c6d-a9b7-cad2708837ac/bucket/64c47ecb-0129-4cfd-b8b5-303bf6157694.png";

const PLACES = [
  {
    id: 1,
    name: "Парк Хуамин",
    desc: "Сакура, пруды и японские беседки",
    img: "https://cdn.poehali.dev/projects/cfc5af78-3f02-4c6d-a9b7-cad2708837ac/files/76c9f59b-6ec3-459c-af85-a811bad22203.jpg",
  },
  {
    id: 2,
    name: "Филёвский парк, Береговой",
    desc: "Набережная Москвы-реки, закат и свежий воздух",
    img: "https://cdn.poehali.dev/projects/cfc5af78-3f02-4c6d-a9b7-cad2708837ac/files/a3bcc820-1262-48fd-8a9f-ee360ad96951.jpg",
  },
  {
    id: 3,
    name: "Ресторан Hedonist",
    desc: "Уютная атмосфера и вкусная еда",
    img: "https://cdn.poehali.dev/projects/cfc5af78-3f02-4c6d-a9b7-cad2708837ac/files/c02170dd-a46f-4de5-9a72-aa0771444ee0.jpg",
  },
  {
    id: 4,
    name: "Музей Зиларт",
    desc: "Современное искусство в самом сердце Москвы",
    img: "https://cdn.poehali.dev/projects/cfc5af78-3f02-4c6d-a9b7-cad2708837ac/files/e837e701-aa56-429a-bf8a-8d8416a50ecc.jpg",
  },
  {
    id: 5,
    name: "Крыша Останкинской Телебашни",
    desc: "Панорама всей Москвы с высоты 337 м",
    img: "https://cdn.poehali.dev/projects/cfc5af78-3f02-4c6d-a9b7-cad2708837ac/files/4c1bb245-d7aa-4a0d-a3ef-b10fad97b818.jpg",
  },
  {
    id: 6,
    name: "Кинотеатр на Таганке",
    desc: "Кино под открытым небом с огнями города",
    img: "https://cdn.poehali.dev/projects/cfc5af78-3f02-4c6d-a9b7-cad2708837ac/files/b60c496a-a27e-4901-b687-4935315ce948.jpg",
  },
];

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
  const [chosenPlace, setChosenPlace] = useState<typeof PLACES[0] | null>(null);
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

  // Финальный экран — место выбрано
  if (chosenPlace) {
    return (
      <div className="meme-page">
        <ScatteredPetals />
        <div className="meme-card animate-in">
          <img src={chosenPlace.img} alt={chosenPlace.name} className="cat-img place-img-final" />
          <h1 className="meme-question yes-text">🎉 Отлично!</h1>
          <p className="meme-sub">Встречаемся в:<br /><strong>{chosenPlace.name}</strong> 💝</p>
        </div>
      </div>
    );
  }

  // Экран выбора места
  if (answered === "yes") {
    return (
      <div className="meme-page places-page">
        <ScatteredPetals />
        <div className="places-card animate-in">
          <h1 className="places-title">Здорово!) А теперь выбери место 🗺️</h1>
          <div className="places-grid">
            {PLACES.map(place => (
              <button
                key={place.id}
                className="place-item"
                onClick={() => setChosenPlace(place)}
              >
                <img src={place.img} alt={place.name} className="place-img" />
                <span className="place-name">{place.name}</span>
                <span className="place-desc">{place.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (answered === "maybe") {
    return (
      <div className="meme-page">
        <ScatteredPetals />
        <div className="meme-card animate-in">
          <img src={CAT_IMG} alt="пёс" className="cat-img" />
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
        <img src={CAT_IMG} alt="пёс" className="cat-img" />
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