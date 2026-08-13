"use client";

import { useEffect, useRef, useState } from "react";

interface NextViewButtonProps {
  /** URL of the next view — the other view in a loop, or the next one once there are more than two. */
  href: string;
}

interface Position {
  x: number;
  y: number;
}

const SIZE = 135; // matches ShuffleButton
const DRAG_THRESHOLD = 4;
const STORAGE_KEY = "next-view-button-position";

/**
 * Clickable next.png — navigates to the next view. Same drag-to-move
 * mechanics as ShuffleButton (see there for why pointer capture, not
 * window listeners), but since this triggers real navigation instead of a
 * callback, dragging is distinguished by cancelling the browser's own click
 * (via preventDefault) rather than deciding whether to call a handler.
 */
export function NextViewButton({ href }: NextViewButtonProps) {
  const rootRef = useRef<HTMLAnchorElement>(null);
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

  const handlePointerDown = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const rect = rootRef.current!.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, originLeft: rect.left, originTop: rect.top, moved: false };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
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

  const handlePointerUp = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const drag = dragRef.current;
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (drag?.moved) {
      const rect = rootRef.current!.getBoundingClientRect();
      persist({ x: rect.left, y: rect.top });
    }
    // dragRef itself is cleared in handleClick, once we know whether to cancel navigation.
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (dragRef.current?.moved) {
      e.preventDefault();
    }
    dragRef.current = null;
  };

  const positioned = position !== null;

  return (
    <a
      ref={rootRef}
      href={href}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
      className={positioned ? undefined : "next-view-button"}
      aria-label="Ir a la siguiente vista"
      style={{
        position: "fixed",
        ...(positioned ? { left: position.x, top: position.y, right: "auto", bottom: "auto", transform: "none" } : {}),
        zIndex: 1000,
        width: SIZE,
        height: SIZE,
        display: "block",
        cursor: "grab",
        touchAction: "none",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static public asset, no benefit from next/image here */}
      <img
        src="/next.png"
        alt=""
        style={{ width: "100%", height: "100%", display: "block", pointerEvents: "none" }}
        draggable={false}
      />
    </a>
  );
}
