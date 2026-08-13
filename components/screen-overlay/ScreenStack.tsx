"use client";

import type { ScreenConfig, ScreensConfig } from "@/lib/geometry/types";
import { ScreenOverlay } from "./ScreenOverlay";

interface ScreenStackProps {
  screens: ScreensConfig;
  containerWidth: number;
  containerHeight: number;
  getVideoSrc: (screen: ScreenConfig) => string | undefined;
}

/** Renders every screen in stacking order, honoring the overlaps configured per screen. */
export function ScreenStack({ screens, containerWidth, containerHeight, getVideoSrc }: ScreenStackProps) {
  const ordered = [...screens].sort((a, b) => a.order - b.order);

  return (
    <>
      {ordered.map((screen) => {
        const src = getVideoSrc(screen);
        if (!src) return null;
        return (
          <ScreenOverlay
            key={screen.id}
            corners={screen.corners}
            containerWidth={containerWidth}
            containerHeight={containerHeight}
            zIndex={screen.order}
            videoSrc={src}
          />
        );
      })}
    </>
  );
}
