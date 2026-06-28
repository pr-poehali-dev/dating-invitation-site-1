import ScatteredPetals from "@/components/ScatteredPetals";

interface Place {
  name: string;
  img?: string;
  videoUrl?: string;
}

interface Props {
  place: Place;
  date: Date;
}

export default function FinalCard({ place, date }: Props) {
  const fmt = date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="meme-page places-page">
      <ScatteredPetals />
      <div
        className="places-card animate-in"
        style={{
          maxWidth: "min(80vw, 1000px)",
          width: "min(80vw, 1000px)",
          marginTop: "-8vh",
          transform: "scale(0.85)",
          transformOrigin: "top center",
        }}
      >
        <h1 className="places-title" style={{ color: "var(--rose-dark)" }}>
          Буду ждать 😉
        </h1>
        {place.videoUrl ? (
          <video
            className="place-img"
            src={place.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            style={{ objectFit: "cover", pointerEvents: "none" }}
          />
        ) : place.img ? (
          <img
            src={place.img}
            alt={place.name}
            style={{ width: "100%", borderRadius: "1.4rem", maxHeight: 400, objectFit: "cover" }}
          />
        ) : null}
        <p
          className="place-name"
          style={{
            fontSize: "2.5rem",
            lineHeight: 1.4,
            textAlign: "center",
            marginTop: "2rem",
            whiteSpace: "nowrap",
            overflow: "visible",
          }}
        >
          📍 {place.name}
        </p>
        <p
          className="place-name"
          style={{
            fontSize: "2.5rem",
            lineHeight: 1.4,
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          📅 {fmt}
        </p>
      </div>
    </div>
  );
}