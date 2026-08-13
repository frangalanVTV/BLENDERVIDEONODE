"use client";

import { useEffect, useState, type RefObject } from "react";

export interface ContainedRect {
  width: number;
  height: number;
  left: number;
  top: number;
}

/**
 * Given a container and an image's natural size, computes the rect the
 * image actually occupies inside that container under `object-fit: contain`
 * (i.e. accounting for letterboxing). Screen overlays are positioned
 * relative to this rect, not the raw container, so they stay pixel-aligned
 * with the render at any viewport size or aspect ratio.
 */
export function useContainedRect(
  containerRef: RefObject<HTMLElement | null>,
  naturalWidth: number,
  naturalHeight: number,
): ContainedRect {
  const [rect, setRect] = useState<ContainedRect>({ width: 0, height: 0, left: 0, top: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !naturalWidth || !naturalHeight) return;

    const recompute = () => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const containerRatio = cw / ch;
      const imageRatio = naturalWidth / naturalHeight;

      let width: number;
      let height: number;
      if (imageRatio > containerRatio) {
        width = cw;
        height = cw / imageRatio;
      } else {
        height = ch;
        width = ch * imageRatio;
      }

      setRect({
        width,
        height,
        left: (cw - width) / 2,
        top: (ch - height) / 2,
      });
    };

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, naturalWidth, naturalHeight]);

  return rect;
}
