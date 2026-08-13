"use client";

import type { NormalizedPoint } from "@/lib/geometry/types";

interface CornerHandleProps {
  normalized: NormalizedPoint;
  containerWidth: number;
  containerHeight: number;
  onDrag: (clientX: number, clientY: number) => void;
}

/**
 * A single draggable dot marking one corner of a screen's quadrilateral.
 *
 * Uses native Pointer Capture instead of manually wiring window-level
 * mousemove/mouseup listeners: `setPointerCapture` keeps this element
 * receiving move/up events for that pointer even once the cursor leaves its
 * 16px hit area, and it survives re-renders on its own (no effect cleanup
 * to accidentally tear it down mid-drag).
 */
export function CornerHandle({ normalized, containerWidth, containerHeight, onDrag }: CornerHandleProps) {
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 0) return; // hovering, not dragging
    onDrag(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: "absolute",
        left: normalized.x * containerWidth,
        top: normalized.y * containerHeight,
        width: 16,
        height: 16,
        marginLeft: -8,
        marginTop: -8,
        borderRadius: "50%",
        background: "#22c55e",
        border: "2px solid #fff",
        cursor: "grab",
        zIndex: 2000,
        touchAction: "none",
        pointerEvents: "auto",
      }}
    />
  );
}
