import { useState, useRef, useEffect } from "react";
import ScatteredPetals from "@/components/ScatteredPetals";
import DatePickerScreen from "@/components/DatePickerScreen";
import SearchingScreen from "@/components/SearchingScreen";

const CAT_IMG =
  "https://cdn.poehali.dev/projects/cfc5af78-3f02-4c6d-a9b7-cad2708837ac/bucket/64c47ecb-0129-4cfd-b8b5-303bf6157694.png";

const PLACES = [
  {
    id: 1,
    name: "Поездка на катере вдвоём",
    desc: "Поездка на катере вдвоём",
    img: "",
    videoUrl: "https://a.videovssylku.ru/2026/06/19/VID_20260619_162720.mp4",
  },
  {
    id: 2,
    name: "Частный кинотеатр SecretCinema",
    desc: "Частный кинотеатр SecretCinema",
    img: "",
    videoUrl: "https://a.videovssylku.ru/2026/06/19/VID_20260619_162443.mp4",
  },
  {
    id: 3,
    name: "Китайский парк Хуамин",
    desc: "Китайский парк Хуамин",
    img: "",
    videoUrl: "https://a.videovssylku.ru/2026/06/19/VID_20260619_162439.mp4",
  },
  {
    id: 4,
    name: "Концерт при свете 3000 свечей",
    desc: "Концерт при свете 3000 свечей",
    img: "",
    videoUrl: "https://a.videovssylku.ru/2026/06/19/VID_20260619_164140.mp4",
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

export default function Index() {
  const [answered, setAnswered] = useState<"yes" | "maybe" | null>(null);
  const [searching, setSearching] = useState(false);
  const [chosenPlace, setChosenPlace] = useState<(typeof PLACES)[0] | null>(
    null,
  );
  const [chosenDate, setChosenDate] = useState<Date | null>(null);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [noDodgeCount, setNoDodgeCount] = useState(0);
  const [showMaybeHint, setShowMaybeHint] = useState(false);
  const [maybeFading, setMaybeFading] = useState(false);
  const noRef = useRef<HTMLButtonElement>(null);
  const noPosRef = useRef({ x: 0, y: 0 });

  const handleMaybeClick = () => {
    setShowMaybeHint(true);
    setMaybeFading(true);
  };

  useEffect(() => {
    const btn = noRef.current;
    if (!btn) return;

    const OFFSET = 220;
    const MARGIN = 24;
    let jumping = false;
    let wasInside = false;

    btn.style.pointerEvents = "none";

    function jump(clientX: number, clientY: number) {
      if (jumping) return;
      jumping = true;
      setTimeout(() => {
        jumping = false;
      }, 320);

      const rect = btn!.getBoundingClientRect();
      const pos = noPosRef.current;

      const originLeft = rect.left - pos.x;
      const originTop = rect.top - pos.y;

      const minX = -originLeft + MARGIN;
      const maxX = window.innerWidth - originLeft - rect.width - MARGIN;
      const minY = -originTop + MARGIN;
      const maxY = window.innerHeight - originTop - rect.height - MARGIN;

      const btnCx = rect.left + rect.width / 2;
      const btnCy = rect.top + rect.height / 2;

      const dx = btnCx - clientX;
      const dy = btnCy - clientY;
      const baseAngle = Math.atan2(dy, dx);
      const spread = (Math.random() - 0.5) * ((Math.PI * 2) / 3);
      const angle = baseAngle + spread;

      let nx = pos.x + Math.cos(angle) * OFFSET;
      let ny = pos.y + Math.sin(angle) * OFFSET;

      let bounced = false;
      if (nx < minX) {
        nx = minX;
        bounced = true;
      } else if (nx > maxX) {
        nx = maxX;
        bounced = true;
      }
      if (ny < minY) {
        ny = minY;
        bounced = true;
      } else if (ny > maxY) {
        ny = maxY;
        bounced = true;
      }

      if (bounced) {
        const awayX = btnCx > window.innerWidth / 2 ? -1 : 1;
        const awayY = btnCy > window.innerHeight / 2 ? -1 : 1;
        const rnd = Math.random() > 0.5;
        nx = Math.max(
          minX,
          Math.min(
            maxX,
            pos.x +
              (rnd ? awayX : Math.sign(Math.cos(angle))) *
                OFFSET *
                (0.7 + Math.random() * 0.6),
          ),
        );
        ny = Math.max(
          minY,
          Math.min(
            maxY,
            pos.y +
              (!rnd ? awayY : Math.sign(Math.sin(angle))) *
                OFFSET *
                (0.7 + Math.random() * 0.6),
          ),
        );
      }

      noPosRef.current = { x: nx, y: ny };
      setNoPos({ x: nx, y: ny });
    }

    function onDocMouseMove(e: MouseEvent) {
      const rect = btn!.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (inside && !wasInside) {
        setNoDodgeCount((prev) => prev + 1);
      }
      wasInside = inside;

      if (inside) jump(e.clientX, e.clientY);
    }

    document.addEventListener("mousemove", onDocMouseMove);
    return () => {
      document.removeEventListener("mousemove", onDocMouseMove);
      btn.style.pointerEvents = "";
    };
  }, []);

  // Финальный экран
  if (chosenPlace && chosenDate) {
    const fmt = chosenDate.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return (
      <div className="meme-page">
        <ScatteredPetals />
        <div className="meme-card animate-in">
          <img
            src={chosenPlace.img}
            alt={chosenPlace.name}
            className="cat-img place-img-final"
          />
          <h1 className="meme-question yes-text">🎉 Ждём не дождёмся!</h1>
          <p className="meme-sub">
            📍 {chosenPlace.name}
            <br />
            📅 {fmt}
          </p>
        </div>
      </div>
    );
  }

  // Экран выбора даты
  if (chosenPlace) {
    return <DatePickerScreen place={chosenPlace} onDone={setChosenDate} />;
  }

  // Экран "ищу места"
  if (searching) {
    return (
      <SearchingScreen
        onDone={() => {
          setSearching(false);
          setAnswered("yes");
        }}
      />
    );
  }

  // Экран выбора места
  if (answered === "yes") {
    return (
      <div className="meme-page places-page">
        <ScatteredPetals />
        <div className="places-card animate-in">
          <h1 className="places-title">Кое-что нашёл!) Выбери место 🗺️</h1>
          <div className="places-grid">
            {PLACES.map((place) => (
              <button
                key={place.id}
                className="place-item"
                onClick={() => setChosenPlace(place)}
              >
                {"videoUrl" in place && place.videoUrl ? (
                  <video
                    className="place-img"
                    src={place.videoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{ objectFit: "cover", pointerEvents: "none" }}
                  />
                ) : (
                  <img src={place.img} alt={place.name} className="place-img" />
                )}
                <span className="place-name">{place.name}</span>
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
        {showMaybeHint ? (
          <p className="no-hint">
            У меня тоже эта кнопка постоянно исчезала при нажатии, так и не
            понял почему. Может с кнопкой «Да» всё в порядке?
          </p>
        ) : noDodgeCount >= 3 ? (
          <p className="no-hint">
            Я пытался исправить, чтобы кнопка «Нет» не бегала, но не получилось.
            Возможно, «Я подумаю» работает?
          </p>
        ) : null}
        <h1 className="meme-question">🌸 Пойдёшь со мной на свидание? 🌸</h1>
        <div className="meme-buttons">
          <button
            className="bubble-btn bubble-yes"
            onClick={() => setSearching(true)}
          >
            Да ✔️
          </button>
          <button
            className="bubble-btn bubble-maybe"
            onClick={handleMaybeClick}
            style={
              maybeFading
                ? {
                    opacity: 0,
                    transition: "opacity 1.5s ease",
                    pointerEvents: "none",
                  }
                : {}
            }
          >
            я подумаю 🤔
          </button>
          <button
            ref={noRef}
            className="bubble-btn bubble-no"
            style={{
              transform: `translate(${noPos.x}px, ${noPos.y}px)`,
              transition: "transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            нет ❌
          </button>
        </div>
      </div>
    </div>
  );
}
