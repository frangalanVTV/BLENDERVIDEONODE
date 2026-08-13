import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { ScreensConfig } from "../geometry/types";

const SCREENS_PATH = path.join(process.cwd(), "data", "screens.json");

export function readScreens(): ScreensConfig {
  const raw = fs.readFileSync(SCREENS_PATH, "utf-8");
  return JSON.parse(raw) as ScreensConfig;
}

export function writeScreens(screens: ScreensConfig): void {
  fs.writeFileSync(SCREENS_PATH, JSON.stringify(screens, null, 2) + "\n", "utf-8");
}
