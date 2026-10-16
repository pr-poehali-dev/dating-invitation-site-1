const VEIL_COLOR = "#f9c6d8";
const FADE_IN_MS = 2600;
const HOLD_MS = 500;
const FADE_OUT_MS = 2200;

export function playPinkVeil(onCovered: () => void) {
  const veil = document.createElement("div");
  Object.assign(veil.style, {
    position: "fixed",
    inset: "0",
    zIndex: "99999",
    background: VEIL_COLOR,
    opacity: "0",
    pointerEvents: "none",
    transition: `opacity ${FADE_IN_MS}ms cubic-bezier(0.45, 0, 0.55, 1)`,
  });
  document.body.appendChild(veil);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      veil.style.opacity = "1";
    });
  });

  setTimeout(() => {
    onCovered();
    setTimeout(() => {
      veil.style.transition = `opacity ${FADE_OUT_MS}ms cubic-bezier(0.45, 0, 0.25, 1)`;
      veil.style.opacity = "0";
      setTimeout(() => veil.remove(), FADE_OUT_MS + 100);
    }, HOLD_MS);
  }, FADE_IN_MS + 100);
}

export default playPinkVeil;
