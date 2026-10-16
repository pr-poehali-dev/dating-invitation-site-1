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

// Создаёт PNG-силуэт сердца ОДИН раз. Форма строится через Безье (как у эмодзи),
// заливается чёрным. Дальше его просто двигаем/поворачиваем — форма всегда идентична.
function makeHeartStamp(size: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.translate(size / 2, size / 2);
  const s = size / 32; // масштаб под систему координат ниже
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(0, 0, 5 * s, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 5 * s, Math.sin(a) * 5 * s, 5.8 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  return c;
}


const MASK_SCALE = 0.5;
const MASK_EVERY_MS = 33;

export default function HeartTransition({ onDone, finalContent, datepickerContent }: Props) {
  const doneRef = useRef(false);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });

  const trailRef = useRef<HTMLCanvasElement | null>(null);
  const stampRef = useRef<HTMLCanvasElement | null>(null);
  const emojiRef = useRef<HTMLDivElement | null>(null);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const finalRef = useRef<HTMLDivElement | null>(null);
  const lastMaskRef = useRef(0);
  const encodingRef = useRef(false);
  const blobUrlRef = useRef<string>("");

  useEffect(() => {
    const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const c = document.createElement("canvas");
    c.width = Math.ceil(dims.w * MASK_SCALE);
    c.height = Math.ceil(dims.h * MASK_SCALE);
    trailRef.current = c;
    const stampSize = Math.ceil(dims.h * 0.9 * 1.45 * MASK_SCALE);
    stampRef.current = makeHeartStamp(stampSize);
  }, [dims.w, dims.h]);

  useEffect(() => {
    const applyMask = (url: string) => {
      const old = blobUrlRef.current;
      blobUrlRef.current = url;
      const picker = pickerRef.current;
      if (picker) {
        const v = `linear-gradient(#000,#000), url(${url})`;
        picker.style.maskImage = v;
        picker.style.webkitMaskImage = v;
      }
      const fin = finalRef.current;
      if (fin) {
        fin.style.maskImage = `url(${url})`;
        fin.style.webkitMaskImage = `url(${url})`;
      }
      if (old) setTimeout(() => URL.revokeObjectURL(old), 200);
    };

    const animate = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const p = Math.min((now - startRef.current) / DURATION, 1);

      const heartCenterVw = -HEART_HALF_VW + p * (100 + HEART_HALF_VW * 2);
      const rotate = p * 540;
      const el = emojiRef.current;
      if (el) {
        el.style.transform = `translate3d(${heartCenterVw - HEART_HALF_VW}vw, -50%, 0) rotate(${rotate}deg)`;
      }

      const c = trailRef.current;
      const stamp = stampRef.current;
      if (c && stamp) {
        const ctx = c.getContext("2d");
        if (ctx) {
          const textLeftPx = ((heartCenterVw - HEART_HALF_VW) / 100) * dims.w;
          const fontPx = dims.h * 0.9;
          const cx = (textLeftPx + 0.5 * fontPx) * MASK_SCALE;
          const cy = (dims.h / 2) * MASK_SCALE;
          const rad = (rotate * Math.PI) / 180;

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(rad);
          ctx.scale(1.06, 1.06);
          ctx.drawImage(stamp, -stamp.width / 2, -stamp.height / 2);
          ctx.restore();

          if (!encodingRef.current && now - lastMaskRef.current >= MASK_EVERY_MS) {
            lastMaskRef.current = now;
            encodingRef.current = true;
            c.toBlob((blob) => {
              encodingRef.current = false;
              if (blob && !doneRef.current) applyMask(URL.createObjectURL(blob));
            });
          }
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

  useEffect(
    () => () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    },
    [],
  );

  return createPortal(
    <>
      <div
        ref={pickerRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99996,
          pointerEvents: "none",
          maskSize: "100% 100%, 100% 100%",
          WebkitMaskSize: "100% 100%, 100% 100%",
          maskComposite: "subtract",
          WebkitMaskComposite: "xor",
        }}
      >
        {datepickerContent}
      </div>

      {finalContent && (
        <div
          ref={finalRef}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99997,
            pointerEvents: "none",
            maskImage: "linear-gradient(transparent, transparent)",
            WebkitMaskImage: "linear-gradient(transparent, transparent)",
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
          }}
        >
          {finalContent}
        </div>
      )}

      <div style={{ position: "fixed", inset: 0, zIndex: 99999, pointerEvents: "none", overflow: "hidden" }}>
        <div
          ref={emojiRef}
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            fontSize: HEART_SIZE,
            lineHeight: 1,
            whiteSpace: "nowrap",
            willChange: "transform",
            transform: `translate3d(${-HEART_HALF_VW * 2}vw, -50%, 0)`,
          }}
        >
          <div style={{ filter: "drop-shadow(0 0 30px rgba(255,150,190,0.5))" }}>🌸</div>
        </div>
      </div>
    </>,
    document.body,
  );
}
