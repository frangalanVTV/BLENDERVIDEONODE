"use client";

import { useEffect, useRef, useState } from "react";

interface ControlClusterProps {
  onShuffle: () => void;
  /** URL of the next view — the other view in a loop, or the next one once there are more than two. */
  nextHref: string;
}

interface Position {
  x: number;
  y: number;
}

const ICON_SIZE = 135;
const GAP = 12;
const CLUSTER_WIDTH = ICON_SIZE * 2 + GAP;
const DRAG_THRESHOLD = 4; // px of movement before a press counts as a drag, not a tap
const STORAGE_KEY = "control-cluster-position";

/**
 * Shuffle + next-view buttons, as ONE draggable unit instead of two
 * independent ones. They used to move (and persist their position)
 * separately, which meant nothing stopped them from ending up on top of
 * each other — especially on touch, where a tap easily registers a few px
 * of movement and silently "escapes" the responsive default. Fixing their
 * relative layout with flexbox inside a single draggable container makes
 * overlap impossible by construction, not just unlikely.
 */
export function ControlCluster({ onShuffle, nextHref }: ControlClusterProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position | null>(null);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    originLeft: number;
    originTop: number;
    moved: boolean;
    pressedAction: "shuffle" | "next" | null;
  } | null>(null);

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

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = rootRef.current!.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    const target = e.target as HTMLElement;
    const pressedAction = target.closest<HTMLElement>("[data-action]")?.dataset.action as "shuffle" | "next" | undefined;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originLeft: rect.left,
      originTop: rect.top,
      moved: false,
      pressedAction: pressedAction ?? null,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || e.buttons === 0) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    drag.moved = true;
    const maxX = Math.max(window.innerWidth - CLUSTER_WIDTH, 0);
    const maxY = Math.max(window.innerHeight - ICON_SIZE, 0);
    setPosition({
      x: Math.min(Math.max(drag.originLeft + dx, 0), maxX),
      y: Math.min(Math.max(drag.originTop + dy, 0), maxY),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (drag?.moved) {
      const rect = rootRef.current!.getBoundingClientRect();
      persist({ x: rect.left, y: rect.top });
    } else if (drag?.pressedAction === "shuffle") {
      onShuffle();
    } else if (drag?.pressedAction === "next") {
      window.location.href = nextHref;
    }
  };

  // setPointerCapture on the container (needed so dragging tracks correctly
  // past the icons' edges) retargets the eventual click to the container
  // too, in Chrome and Safari alike — the <a> below never sees a "real"
  // click, so its native navigation silently never fires. Navigation is
  // therefore handled entirely above, in handlePointerUp; this only ever
  // suppresses the native click so it can't double-navigate on the rare
  // browser where the click *does* still reach the anchor.
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
  };

  const positioned = position !== null;

  return (
    <div
      ref={rootRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={positioned ? undefined : "control-cluster"}
      style={{
        position: "fixed",
        ...(positioned ? { left: position.x, top: position.y, right: "auto", bottom: "auto", transform: "none" } : {}),
        zIndex: 1000,
        display: "flex",
        gap: GAP,
        cursor: "grab",
        touchAction: "none",
      }}
    >
      <button
        data-action="shuffle"
        aria-label="Cambiar videos"
        style={{ width: ICON_SIZE, height: ICON_SIZE, padding: 0, border: "none", background: "transparent" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static public asset, no benefit from next/image here */}
        <img
          src="/shuffle.png"
          alt=""
          style={{ width: "100%", height: "100%", display: "block", pointerEvents: "none" }}
          draggable={false}
        />
      </button>

      <a
        data-action="next"
        href={nextHref}
        onClick={handleLinkClick}
        aria-label="Ir a la siguiente vista"
        style={{ width: ICON_SIZE, height: ICON_SIZE, display: "block" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static public asset, no benefit from next/image here */}
        <img
          src="/next.png"
          alt=""
          style={{ width: "100%", height: "100%", display: "block", pointerEvents: "none" }}
          draggable={false}
        />
      </a>
    </div>
  );
}
