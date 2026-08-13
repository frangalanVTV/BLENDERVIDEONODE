import type { NormalizedPoint, ScreenCorners } from "./types";

/**
 * Row-major 3x3 projective matrix:
 *   [ a  b  c ]
 *   [ d  e  f ]
 *   [ g  h  1 ]
 */
export type Mat3 = [number, number, number, number, number, number, number, number, number];

/**
 * Computes the exact projective transform (homography) that maps the unit
 * square (0,0)-(1,0)-(1,1)-(0,1) onto an arbitrary quadrilateral.
 *
 * This is Paul Heckbert's closed-form "square-to-quad" solution (Fundamentals
 * of Texture Mapping and Image Warping, 1989). It is not an approximation:
 * a projective map has 8 degrees of freedom, exactly matching the 8
 * constraints from 4 point correspondences, so the 4 target corners are
 * matched exactly.
 */
export function squareToQuadMatrix(quad: [NormalizedPoint, NormalizedPoint, NormalizedPoint, NormalizedPoint]): Mat3 {
  const [p0, p1, p2, p3] = quad;

  const dx1 = p1.x - p2.x;
  const dx2 = p3.x - p2.x;
  const dx3 = p0.x - p1.x + p2.x - p3.x;
  const dy1 = p1.y - p2.y;
  const dy2 = p3.y - p2.y;
  const dy3 = p0.y - p1.y + p2.y - p3.y;

  let a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number;

  if (dx3 === 0 && dy3 === 0) {
    // Degenerate case: target is a parallelogram, the map is purely affine.
    a = p1.x - p0.x;
    b = p2.x - p1.x;
    c = p0.x;
    d = p1.y - p0.y;
    e = p2.y - p1.y;
    f = p0.y;
    g = 0;
    h = 0;
  } else {
    const denom = dx1 * dy2 - dx2 * dy1;
    g = (dx3 * dy2 - dx2 * dy3) / denom;
    h = (dx1 * dy3 - dx3 * dy1) / denom;
    a = p1.x - p0.x + g * p1.x;
    b = p3.x - p0.x + h * p3.x;
    c = p0.x;
    d = p1.y - p0.y + g * p1.y;
    e = p3.y - p0.y + h * p3.y;
    f = p0.y;
  }

  return [a, b, c, d, e, f, g, h, 1];
}

/**
 * Composes a square-to-quad homography with a pre-scale so the *source*
 * rectangle is (0,0)-(w,0)-(w,h)-(0,h) in CSS pixels instead of the unit
 * square. This lets us apply the resulting matrix directly to a DOM element
 * sized w x h, without normalizing its own coordinates first.
 */
export function pixelHomography(corners: ScreenCorners, width: number, height: number): Mat3 {
  const quad = corners.map((p) => ({ x: p.x * width, y: p.y * height })) as [
    NormalizedPoint,
    NormalizedPoint,
    NormalizedPoint,
    NormalizedPoint,
  ];
  const [a, b, c, d, e, f, g, h, i] = squareToQuadMatrix(quad);
  return [a / width, b / height, c, d / width, e / height, f, g / width, h / height, i];
}
