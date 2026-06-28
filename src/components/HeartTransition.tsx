import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  onDone: () => void;
  finalContent: React.ReactNode;
  datepickerContent: React.ReactNode;
}

const DURATION = 5000;
const HEART_SIZE = "90vh";
const HEART_HALF_VW = 45;

export default function HeartTransition({ onDone, finalContent, datepickerContent }: Props) {
  const doneRef = useRef(false);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [maskUrl, setMaskUrl] = useState<string>("");

  // Canvas, на котором накапливается след сердца (НЕ очищается между кадрами)
  const trailRef = useRef<HTMLCanvasElement | null>(null);
  // Временный canvas для отрисовки силуэта эмодзи каждого кадра
  const tmpRef = useRef<HTMLCanvasElement | null>(null);
  // Позиция эмодзи для рендера
  const [emoji, setEmoji] = useState({ x: -HEART_HALF_VW, rot: 0 });

  useEffect(() => {
    const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Инициализируем canvas следа при изменении размеров
  useEffect(() => {
    const c = document.createElement("canvas");
    c.width = dims.w;
    c.height = dims.h;
    trailRef.current = c;
    const t = document.createElement("canvas");
    t.width = dims.w;
    t.height = dims.h;
    tmpRef.current = t;
  }, [dims.w, dims.h]);

  useEffect(() => {
    const animate = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const p = Math.min((now - startRef.current) / DURATION, 1);

      const heartCenterVw = -HEART_HALF_VW + p * (100 + HEART_HALF_VW * 2);
      const rotate = p * 540;
      setEmoji({ x: heartCenterVw, rot: rotate });

      // Рисуем сердце на canvas следа (накопление, без очистки)
      const c = trailRef.current;
      const tmp = tmpRef.current;
      if (c && tmp) {
        const ctx = c.getContext("2d");
        const tctx = tmp.getContext("2d");
        if (ctx && tctx) {
          // Маска-след — это ТОТ ЖЕ эмодзи ❤️, что и красное сердце, в той же
          // позиции/размере/повороте. Значит маска 1-в-1 повторяет красное сердце.
          const textLeftPx = ((heartCenterVw - HEART_HALF_VW) / 100) * dims.w;
          const fontPx = dims.h * 0.9; // font-size 90vh
          const cx = textLeftPx + 0.5 * fontPx; // центр глифа по X (как в CSS-блоке)
          const cy = dims.h / 2; // вертикальный центр (translateY(-50%))
          const rad = (rotate * Math.PI) / 180;

          // 1) Рисуем эмодзи на временном canvas
          tctx.clearRect(0, 0, tmp.width, tmp.height);
          tctx.save();
          tctx.translate(cx, cy);
          tctx.rotate(rad);
          tctx.font = `${fontPx}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
          tctx.textAlign = "center";
          tctx.textBaseline = "middle";
          tctx.fillText("❤️", 0, 0);
          // 2) Превращаем цветной глиф в сплошной чёрный силуэт (по его альфе)
          tctx.globalCompositeOperation = "source-in";
          tctx.fillStyle = "#000";
          tctx.fillRect(0, 0, tmp.width, tmp.height);
          tctx.restore();

          // 3) Переносим силуэт на накопительный canvas следа
          ctx.drawImage(tmp, 0, 0);

          setMaskUrl(c.toDataURL());
        }
      }

      if (p >= 1) {
        if (!doneRef.current) {
          doneRef.current = true;
          onDone();
        }
        return;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onDone, dims.w, dims.h]);

  return createPortal(
    <>
      {/* DatePicker — везде, КРОМЕ области, которую уже прошло сердце (инверсия маски) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99996,
          pointerEvents: "none",
          maskImage: maskUrl ? `url(${maskUrl})` : undefined,
          WebkitMaskImage: maskUrl ? `url(${maskUrl})` : undefined,
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
          maskMode: "luminance",
          WebkitMaskComposite: "destination-out",
          maskComposite: "subtract",
        }}
      >
        {datepickerContent}
      </div>

      {/* Финальный экран — виден там, где прошло сердце (по маске-следу) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99997,
          pointerEvents: "none",
          maskImage: maskUrl ? `url(${maskUrl})` : undefined,
          WebkitMaskImage: maskUrl ? `url(${maskUrl})` : undefined,
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
        }}
      >
        {finalContent}
      </div>

      {/* Само сердце */}
      <div style={{ position: "fixed", inset: 0, zIndex: 99999, pointerEvents: "none", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            fontSize: HEART_SIZE,
            lineHeight: 1,
            whiteSpace: "nowrap",
            transform: `translateY(-50%) translateX(${emoji.x - HEART_HALF_VW}vw) rotate(${emoji.rot}deg)`,
            filter: "drop-shadow(0 0 30px rgba(255,80,120,0.4))",
          }}
        >
          ❤️
        </div>
      </div>
    </>,
    document.body,
  );
}