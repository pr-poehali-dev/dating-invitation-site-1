const PETALS = [
  "🌸", "🌸", "🌸", "💮", "🌸", "🌸", "💮", "🌸", "🌸", "🌸",
  "💮", "🌸", "🌸", "🌸", "💮", "🌸", "🌸", "🌸", "💮", "🌸",
  "🌸", "💮", "🌸", "🌸", "🌸", "💮", "🌸", "🌸",
];

const floatingPetals = PETALS.map((p, i) => ({
  emoji: p,
  left: `${(i * 3.7 + 1.5) % 100}%`,
  delay: `${(i * 0.38) % 7}s`,
  duration: `${5 + ((i * 0.29) % 5)}s`,
  size: `${1.3 + ((i * 0.15) % 1.1)}rem`,
  opacity: 0.45 + ((i * 0.04) % 0.4),
}));

export default function ScatteredPetals() {
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
