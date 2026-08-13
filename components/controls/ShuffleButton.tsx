"use client";

import { useEffect, useRef, useState } from "react";

interface ShuffleButtonProps {
  onClick: () => void;
}

interface Position {
  x: number;
  y: number;
}

const SIZE = 135; // 10% smaller than the original 150px
const DRAG_THRESHOLD = 4; // px of movement before a press counts as a drag, not a tap
const STORAGE_KEY = "shuffle-button-position";

/**
 * Clickable shuffle.png. Starts pinned bottom-right on desktop / bottom-center
 * on phone widths (.shuffle-button in globals.css). Drag the button to move
 * it anywhere — once moved, the explicit position takes over from the
 * responsive default and persists in localStorage, so it survives the page
 * refresh that happens on every shuffle.
 */
export function ShuffleButton({ onClick }: ShuffleButtonProps) {
  const rootRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<Position | null>(null);

  const dragRef = useRef<{ startX: number; startY: number; originLeft: number; originTop: number; moved: boolean } | null>(
    null,
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      setPosition(JSON.parse(raw) as Position);
    } catch {
      // corrupt or unavailable storage — just fall back to the default position
    }
  }, []);

  const persist = (next: Position) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // e.g. private browsing with storage disabled — position just won't stick
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = rootRef.current!.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, originLeft: rect.left, originTop: rect.top, moved: false };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || e.buttons === 0) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    drag.moved = true;
    const maxX = Math.max(window.innerWidth - SIZE, 0);
    const maxY = Math.max(window.innerHeight - SIZE, 0);
    setPosition({
      x: Math.min(Math.max(drag.originLeft + dx, 0), maxX),
      y: Math.min(Math.max(drag.originTop + dy, 0), maxY),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragRef.current = null;
    if (drag?.moved) {
      const rect = rootRef.current!.getBoundingClientRect();
      persist({ x: rect.left, y: rect.top });
    } else {
      // Pressed and released without dragging past the threshold — a tap, not a move.
      onClick();
    }
  };

  const positioned = position !== null;

  return (
    <button
      ref={rootRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={positioned ? undefined : "shuffle-button"}
      aria-label="Cambiar videos"
      style={{
        position: "fixed",
        ...(positioned ? { left: position.x, top: position.y, right: "auto", bottom: "auto", transform: "none" } : {}),
        zIndex: 1000,
        width: SIZE,
        height: SIZE,
        padding: 0,
        border: "none",
        background: "transparent",
        cursor: "grab",
        touchAction: "none",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static public asset, no benefit from next/image here */}
      <img
        src="/shuffle.png"
        alt=""
        style={{ width: "100%", height: "100%", display: "block", pointerEvents: "none" }}
        draggable={false}
      />
    </button>
  );
}
