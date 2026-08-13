"use client";

import { useCallback, useRef } from "react";
import type { NormalizedPoint, ScreenConfig } from "@/lib/geometry/types";
import { pixelHomography } from "@/lib/geometry/homography";
import { matrix3dFromHomography } from "@/lib/geometry/toMatrix3d";
import { CornerHandle } from "./CornerHandle";

interface CalibrationOverlayProps {
  screen: ScreenConfig;
  containerWidth: number;
  containerHeight: number;
  videoSrc?: string;
  isActive: boolean;
  showHandles: boolean;
  onChangeCorner: (index: number, point: NormalizedPoint) => void;
  /** Normalized (0-1) delta, for dragging the whole quad instead of one corner. */
  onTranslate: (deltaX: number, deltaY: number) => void;
}

/** One screen's live-preview quad plus its 4 draggable corner handles (while not yet confirmed). */
export function CalibrationOverlay({
  screen,
  containerWidth,
  containerHeight,
  videoSrc,
  isActive,
  showHandles,
  onChangeCorner,
  onTranslate,
}: CalibrationOverlayProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);

  // Handles report raw pointer coordinates; converting them to normalized
  // (0-1) space here — against this overlay's own DOM rect — keeps the
  // conversion correct regardless of viewport size or letterboxing.
  const clientToNormalized = useCallback((clientX: number, clientY: number): NormalizedPoint => {
    const bounds = rootRef.current!.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (clientX - bounds.left) / bounds.width)),
      y: Math.min(1, Math.max(0, (clientY - bounds.top) / bounds.height)),
    };
  }, []);

  const canDrag = isActive && showHandles;

  const handleBodyPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canDrag) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleBodyPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canDrag || e.buttons === 0 || !lastPointerRef.current) return;
    const bounds = rootRef.current!.getBoundingClientRect();
    const dx = (e.clientX - lastPointerRef.current.x) / bounds.width;
    const dy = (e.clientY - lastPointerRef.current.y) / bounds.height;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    onTranslate(dx, dy);
  };

  const handleBodyPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canDrag) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    lastPointerRef.current = null;
  };

  const transform = matrix3dFromHomography(pixelHomography(screen.corners, containerWidth, containerHeight));

  return (
    // pointerEvents: "none" here is load-bearing: this div spans the full
    // stage (so the transform below has something to warp), not just its
    // own quad. Without disabling hit-testing on it, whichever screen paints
    // last (highest `order`) would swallow every pointer event on the whole
    // stage, making lower-order screens' corner handles undraggable.
    // The video body and CornerHandle opt back into pointer-events themselves.
    <div
      ref={rootRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: screen.order, pointerEvents: "none" }}
    >
      <div
        onPointerDown={handleBodyPointerDown}
        onPointerMove={handleBodyPointerMove}
        onPointerUp={handleBodyPointerUp}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          transformOrigin: "0 0",
          transform,
          outline: isActive ? "2px solid #22c55e" : "1px dashed rgba(255,255,255,0.35)",
          pointerEvents: canDrag ? "auto" : "none",
          cursor: canDrag ? "move" : "default",
          touchAction: "none",
        }}
      >
        {videoSrc && (
          <video
            key={videoSrc}
            src={videoSrc}
            muted
            autoPlay
            loop
            playsInline
            // object-fit: fill, not cover — see ScreenOverlay for why: this
            // box is the whole render, not the video's own aspect ratio, so
            // "cover" would crop it against an unrelated ratio before the
            // homography even runs. "fill" leaves the full frame intact for
            // the transform to shape.
            style={{
              width: "100%",
              height: "100%",
              objectFit: "fill",
              display: "block",
              opacity: isActive ? 1 : 0.5,
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      {isActive &&
        showHandles &&
        screen.corners.map((corner, index) => (
          <CornerHandle
            key={index}
            normalized={corner}
            containerWidth={containerWidth}
            containerHeight={containerHeight}
            onDrag={(clientX, clientY) => onChangeCorner(index, clientToNormalized(clientX, clientY))}
          />
        ))}
    </div>
  );
}
