"use client";

import { useMemo } from "react";
import type { ScreenCorners } from "@/lib/geometry/types";
import { pixelHomography } from "@/lib/geometry/homography";
import { matrix3dFromHomography } from "@/lib/geometry/toMatrix3d";

interface ScreenOverlayProps {
  corners: ScreenCorners;
  containerWidth: number;
  containerHeight: number;
  zIndex: number;
  videoSrc: string;
}

/** A single video, warped by an exact homography to fill its screen's quadrilateral. */
export function ScreenOverlay({ corners, containerWidth, containerHeight, zIndex, videoSrc }: ScreenOverlayProps) {
  const transform = useMemo(
    () => matrix3dFromHomography(pixelHomography(corners, containerWidth, containerHeight)),
    [corners, containerWidth, containerHeight],
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        transformOrigin: "0 0",
        transform,
        zIndex,
      }}
    >
      {/* key={videoSrc} forces a remount on source change, guaranteeing the new video loads and autoplays (changing `src` in place does not). */}
      {/* object-fit: fill is deliberate, not a default left over — this div is sized to the whole render, not to the video's own aspect ratio, because the homography above expects to warp its entire box onto the target quad. "cover" would crop the video against the render's aspect ratio (unrelated to the video's own dimensions or the quad's) before that warp ever happens. "fill" stretches the whole frame with no independent crop, so the homography is the only thing shaping the final result — corner to corner, as calibrated. */}
      <video
        key={videoSrc}
        src={videoSrc}
        muted
        autoPlay
        loop
        playsInline
        style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }}
      />
    </div>
  );
}
