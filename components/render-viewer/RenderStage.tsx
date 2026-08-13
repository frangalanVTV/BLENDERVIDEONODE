"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useContainedRect } from "@/lib/geometry/useContainedRect";

interface RenderStageProps {
  /** Render prop: receives the render image's displayed pixel size, so overlays can compute pixel-accurate homographies. */
  children: (width: number, height: number) => ReactNode;
  /**
   * Stacking position of frente.png relative to the screen overlays slot
   * (fixed at z-index 500). Defaults above it (900) so physical objects
   * occlude the videos, which is the real production behavior. Calibration
   * passes a value below 500 so frente.png never hides what you're placing.
   */
  frontLayerZIndex?: number;
}

/**
 * The permanent background/foreground sandwich: render.png at the bottom,
 * frente.png on top, with a slot in between (aligned to the render's actual
 * displayed rect, not the raw container) for screen overlays.
 */
export function RenderStage({ children, frontLayerZIndex = 900 }: RenderStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const rect = useContainedRect(containerRef, naturalSize.width, naturalSize.height);

  const captureNaturalSize = (img: HTMLImageElement) => {
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
  };

  // The browser cache can serve render.png as already `complete` before this
  // component mounts (e.g. navigating here after visiting "/"), in which
  // case `onLoad` never fires and naturalSize would stay stuck at 0 forever.
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth) {
      captureNaturalSize(imgRef.current);
    }
  }, []);

  return (
    <div ref={containerRef} style={{ position: "absolute", inset: 0 }}>
      <img
        ref={imgRef}
        src="/render.png"
        alt=""
        onLoad={(e) => captureNaturalSize(e.currentTarget)}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
      />

      {rect.width > 0 && (
        <div
          style={{
            position: "absolute",
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            overflow: "hidden",
            zIndex: 500,
          }}
        >
          {children(rect.width, rect.height)}
        </div>
      )}

      {/* Physical objects from the render that occlude some screens. Shares render.png's aspect ratio, so object-fit: contain lands it on the same rect without extra math. */}
      <img
        src="/frente.png"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          pointerEvents: "none",
          zIndex: frontLayerZIndex,
        }}
      />
    </div>
  );
}
