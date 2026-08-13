/**
 * A point normalized to the render image's own pixel space: (0,0) is the
 * top-left corner of render.png, (1,1) is its bottom-right corner. Storing
 * corners normalized (not in raw pixels) keeps calibration independent of
 * the viewport size the app is displayed at.
 */
export interface NormalizedPoint {
  x: number;
  y: number;
}

/**
 * The four corners of a screen's quadrilateral, in order:
 * P1 = top-left, P2 = top-right, P3 = bottom-right, P4 = bottom-left.
 * This ordering must match the winding used in `squareToQuadMatrix`.
 */
export type ScreenCorners = [
  NormalizedPoint,
  NormalizedPoint,
  NormalizedPoint,
  NormalizedPoint,
];

export interface ScreenConfig {
  id: string;
  label: string;
  /** Folder name under /public/videos holding this screen's video pool. */
  folder: string;
  /** Stacking order; higher draws on top of lower. */
  order: number;
  /** When false, this screen is excluded entirely — not rendered, not calibrated, not part of the shuffle pool. For screens that don't actually appear in the render. */
  visible: boolean;
  corners: ScreenCorners;
}

export type ScreensConfig = ScreenConfig[];
