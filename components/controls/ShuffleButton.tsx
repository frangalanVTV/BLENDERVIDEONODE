"use client";

import { useEffect, useRef, useState } from "react";

interface ShuffleButtonProps {
  onClick: () => void;
}

interface Placement {
  x: number;
  y: number;
  size: number;
}

const DEFAULT_SIZE = 150;
const MIN_SIZE = 60;
const MAX_SIZE = 400;
const DRAG_THRESHOLD = 4; // px of movement before a press counts as a drag, not a tap
const STORAGE_KEY = "shuffle-button-placement";

/**
 * Clickable shuffle.png. Starts pinned bottom-right on desktop / bottom-center
 * on phone widths (.shuffle-button in globals.css). Drag the button to move
 * it anywhere, or the small handle at its corner to resize it — once moved
 * or resized, the explicit position/size take over from the responsive
 * default and persist in localStorage, so they survive the page refresh
 * that happens on every shuffle.
 */
export function ShuffleButton({ onClick }: ShuffleButtonProps) {
  const rootRef = useRef<HTMLButtonElement>(null);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [size, setSize] = useState(DEFAULT_SIZE);

  const dragRef = useRef<{ startX: number; startY: number; originLeft: number; originTop: number; moved: boolean } | null>(
    null,
  );
  const resizeRef = useRef<{ startX: number; startY: number; startSize: number } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Placement;
      setPlacement({ x: saved.x, y: saved.y, size: saved.size });
      setSize(saved.size);
    } catch {
      // corrupt or unavailable storage — just fall back to the default placement
    }
  }, []);

  const persist = (next: Placement) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // e.g. private browsing with storage disabled — position just won't stick
    }
  };

  const handleBodyPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = rootRef.current!.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, originLeft: rect.left, originTop: rect.top, moved: false };
  };

  const handleBodyPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || e.buttons === 0) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    drag.moved = true;
    const maxX = Math.max(window.innerWidth - size, 0);
    const maxY = Math.max(window.innerHeight - size, 0);
    setPlacement({
      x: Math.min(Math.max(drag.originLeft + dx, 0), maxX),
      y: Math.min(Math.max(drag.originTop + dy, 0), maxY),
      size,
    });
  };

  const handleBodyPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragRef.current = null;
    if (drag?.moved) {
      const rect = rootRef.current!.getBoundingClientRect();
      persist({ x: rect.left, y: rect.top, size });
    } else {
      // Pressed and released without dragging past the threshold — a tap, not a move.
      onClick();
    }
  };

  const handleResizePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    resizeRef.current = { startX: e.clientX, startY: e.clientY, startSize: size };
  };

  const handleResizePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const resize = resizeRef.current;
    if (!resize || e.buttons === 0) return;
    const delta = Math.max(e.clientX - resize.startX, e.clientY - resize.startY);
    setSize(Math.min(MAX_SIZE, Math.max(MIN_SIZE, resize.startSize + delta)));
  };

  const handleResizePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.currentTarget.releasePointerCapture(e.pointerId);
    resizeRef.current = null;
    const rect = rootRef.current!.getBoundingClientRect();
    persist({ x: placement?.x ?? rect.left, y: placement?.y ?? rect.top, size });
  };

  const positioned = placement !== null;

  return (
    <button
      ref={rootRef}
      onPointerDown={handleBodyPointerDown}
      onPointerMove={handleBodyPointerMove}
      onPointerUp={handleBodyPointerUp}
      className={positioned ? undefined : "shuffle-button"}
      aria-label="Cambiar videos"
      style={{
        position: "fixed",
        ...(positioned ? { left: placement.x, top: placement.y, right: "auto", bottom: "auto", transform: "none" } : {}),
        zIndex: 1000,
        width: size,
        height: size,
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
      <div
        onPointerDown={handleResizePointerDown}
        onPointerMove={handleResizePointerMove}
        onPointerUp={handleResizePointerUp}
        title="Arrastrar para cambiar el tamaño"
        style={{
          position: "absolute",
          right: -6,
          bottom: -6,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#22c55e",
          border: "2px solid #fff",
          cursor: "nwse-resize",
          touchAction: "none",
        }}
      />
    </button>
  );
}
