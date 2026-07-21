import { useEffect, useRef, useState } from "react";
import ring from "@/assets/hero-ring.png";
import ring2 from "@/assets/hero-ring2.png";
import necklace from "@/assets/hero-necklace.png";
import earrings from "@/assets/hero-earrings.png";
import bracelet from "@/assets/hero-bracelet.png";
import bridal from "@/assets/hero-bridal.png";

const ITEMS = [
  { src: ring, label: "Celeste Solitaire" },
  { src: necklace, label: "Halo Pendant" },
  { src: earrings, label: "Chandelier Drops" },
  { src: bracelet, label: "Filigree Bangle" },
  { src: bridal, label: "Shahzadi Bridal" },
  { src: ring2, label: "Aurora Ring" },
];

/**
 * 3D coverflow rotating carousel — jewellery pieces arranged on a ring in
 * 3D space, auto-rotating in the background. Users can also drag it.
 */
export function HeroSpinSlider() {
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startRot = useRef(0);
  const rafRef = useRef<number>(0);

  // Auto-rotate when not dragging
  useEffect(() => {
    let last = performance.now();
    const tick = (t: number) => {
      const dt = t - last;
      last = t;
      if (!dragging) setRotation((r) => r + dt * 0.015);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [dragging]);

  const onDown = (e: React.PointerEvent) => {
    setDragging(true);
    startX.current = e.clientX;
    startRot.current = rotation;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setRotation(startRot.current + (e.clientX - startX.current) * 0.5);
  };
  const onUp = () => setDragging(false);

  const n = ITEMS.length;
  const radius = 320; // px

  return (
    <div
      className="hero-stage relative flex h-[520px] w-full items-center justify-center select-none touch-none"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <div
        className="hero-ring relative h-72 w-72"
        style={{ transform: `rotateY(${rotation}deg)` }}
      >
        {ITEMS.map((item, i) => {
          const angle = (i / n) * 360;
          return (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2"
              style={{
                transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                transformStyle: "preserve-3d",
              }}
            >
              <div
                className="h-full w-full"
                style={{ transform: `rotateY(${-rotation - angle}deg)` }}
              >
                <img
                  src={item.src}
                  alt={item.label}
                  className="h-full w-full object-contain drop-shadow-[0_20px_40px_rgba(200,160,80,0.45)]"
                  draggable={false}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Soft floor reflection glow */}
      <div className="pointer-events-none absolute bottom-8 h-16 w-[80%] rounded-full bg-gold/20 blur-3xl" />
    </div>
  );
}
