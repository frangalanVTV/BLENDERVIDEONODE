"use client";

import { useCallback, useMemo, useState } from "react";
import type { ScreenConfig, ScreensConfig } from "@/lib/geometry/types";
import type { VideoPool } from "@/lib/video-assignment/getVideoPools.server";
import { assignVideoGroups } from "@/lib/video-assignment/shuffle";
import { RenderStage } from "../render-viewer/RenderStage";
import { ScreenStack } from "../screen-overlay/ScreenStack";
import { ShuffleButton } from "../controls/ShuffleButton";
import { NextViewButton } from "../controls/NextViewButton";

interface ViewerProps {
  renderSrc: string;
  frontSrc: string;
  /** Where the "next view" button sends you — the other view in a 2-view loop, or the next one in sequence once there are more. */
  nextHref: string;
  screens: ScreensConfig;
  videoPools: VideoPool[];
}

/** Production viewer: static render + all screens playing, a button to reshuffle every screen's video, and a button to jump to the next view. */
export function Viewer({ renderSrc, frontSrc, nextHref, screens, videoPools }: ViewerProps) {
  // The shuffle runs over ALL 8 screens, visible or not — a hidden screen
  // still "holds" one of the 8 video slots, it's just never drawn. That
  // keeps the 8-videos-for-8-screens accounting intact even though only 7
  // of them are ever seen at once.
  const screenIds = useMemo(() => screens.map((s) => s.id), [screens]);
  const visibleScreens = useMemo(() => screens.filter((s) => s.visible), [screens]);

  // Every screen carries its own encode of the same content groups, so any
  // one non-empty pool defines the canonical set of group ids to shuffle.
  const canonicalGroupIds = useMemo(
    () => videoPools.find((pool) => pool.groupIds.length > 0)?.groupIds ?? [],
    [videoPools],
  );

  const [assignment, setAssignment] = useState<Record<string, string>>(() =>
    assignVideoGroups(screenIds, canonicalGroupIds),
  );

  const shuffle = useCallback(() => {
    setAssignment(assignVideoGroups(screenIds, canonicalGroupIds));
  }, [screenIds, canonicalGroupIds]);

  const getVideoSrc = useCallback(
    (screen: ScreenConfig) => {
      const groupId = assignment[screen.id];
      return groupId ? `/videos/${screen.folder}/${groupId}.mp4` : undefined;
    },
    [assignment],
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000" }}>
      <RenderStage renderSrc={renderSrc} frontSrc={frontSrc}>
        {(width, height) => (
          <ScreenStack screens={visibleScreens} containerWidth={width} containerHeight={height} getVideoSrc={getVideoSrc} />
        )}
      </RenderStage>

      <ShuffleButton onClick={shuffle} />
      <NextViewButton href={nextHref} />
    </div>
  );
}
