import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { ScreensConfig } from "../geometry/types";

const DATA_DIR = path.join(process.cwd(), "data");

/** filename without extension, e.g. "screens" or "screens2" — one file per view's calibration. */
export function readScreens(name: string = "screens"): ScreensConfig {
  const raw = fs.readFileSync(path.join(DATA_DIR, `${name}.json`), "utf-8");
  return JSON.parse(raw) as ScreensConfig;
}

export function writeScreens(name: string, screens: ScreensConfig): void {
  fs.writeFileSync(path.join(DATA_DIR, `${name}.json`), JSON.stringify(screens, null, 2) + "\n", "utf-8");
}
