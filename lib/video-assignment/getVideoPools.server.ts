import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { ScreensConfig } from "../geometry/types";

export interface VideoPool {
  screenId: string;
  /** Group ids without extension, e.g. "video1", sorted numerically. */
  groupIds: string[];
}

/**
 * Reads which video files actually exist per screen under /public/videos.
 * Derived from disk rather than hardcoded, so dropping a new video file in
 * a screen's folder is immediately reflected without touching config.
 */
export function getVideoPools(screens: ScreensConfig): VideoPool[] {
  const videosRoot = path.join(process.cwd(), "public", "videos");

  return screens.map((screen) => {
    const folder = path.join(videosRoot, screen.folder);
    let files: string[] = [];
    try {
      files = fs.readdirSync(folder);
    } catch {
      files = [];
    }

    const groupIds = files
      .filter((file) => file.toLowerCase().endsWith(".mp4"))
      .map((file) => file.replace(/\.mp4$/i, ""))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    return { screenId: screen.id, groupIds };
  });
}
