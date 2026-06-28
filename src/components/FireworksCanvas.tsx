import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  radius: number;
  gravity: number;
}

interface Rocket {
  x: number;
  y: number;
  vy: number;
  targetY: number;
  color: string;
  trail: { x: number; y: number; alpha: number }[];
  exploded: boolean;
}

const COLORS = [
  "#ff6eb4", "#ff9de2", "#ffb347", "#ffe066",
  "#a8edea", "#fed6e3", "#d4a5f5", "#f9a8d4",
];

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export default function FireworksCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const rocketsRef = useRef<Rocket[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    function launchRocket() {
      if (!canvas) return;
      const side = Math.random() < 0.5 ? "left" : "right";
      const x = side === "left"
        ? Math.random() * canvas.width * 0.25
        : canvas.width * 0.75 + Math.random() * canvas.width * 0.25;
      rocketsRef.current.push({
        x,
        y: canvas.height,
        vy: -(12 + Math.random() * 6),
        targetY: canvas.height * (0.15 + Math.random() * 0.35),
        color: randomColor(),
        trail: [],
        exploded: false,
      });
    }

    function explode(x: number, y: number, color: string) {
      const count = 80 + Math.floor(Math.random() * 40);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
        const speed = 2 + Math.random() * 4;
        particlesRef.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color,
          radius: 2 + Math.random() * 2,
          gravity: 0.08,
        });
      }
    }

    let lastLaunch = 0;

    function draw(now: number) {
      if (!canvas || !ctx) return;

      if (now - lastLaunch > 600 + Math.random() * 400) {
        launchRocket();
        lastLaunch = now;
      }

      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Rockets
      rocketsRef.current = rocketsRef.current.filter((r) => {
        if (r.exploded) return false;
        r.trail.push({ x: r.x, y: r.y, alpha: 1 });
        if (r.trail.length > 12) r.trail.shift();

        r.trail.forEach((t, i) => {
          t.alpha -= 0.08;
          ctx.beginPath();
          ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${Math.max(0, t.alpha * (i / r.trail.length))})`;
          ctx.fill();
        });

        ctx.beginPath();
        ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.fill();

        r.y += r.vy;
        r.vy += 0.15;

        if (r.y <= r.targetY) {
          explode(r.x, r.y, r.color);
          r.exploded = true;
          return false;
        }
        return true;
      });

      // Particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.alpha -= 0.018;

        if (p.alpha <= 0) return false;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();

        return true;
      });

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        width: "100%",
        height: "100%",
      }}
    />
  );
}
