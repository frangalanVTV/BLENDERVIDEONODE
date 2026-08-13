import type { Mat3 } from "./homography";

/**
 * Embeds a 2D projective 3x3 matrix into a CSS `matrix3d()` string.
 *
 * CSS `matrix3d(m1..m16)` lists a 4x4 matrix column-major and applies it to
 * (x, y, z, 1), then perspective-divides by the resulting w. To carry a 2D
 * homography [[a,b,c],[d,e,f],[g,h,1]] through that pipeline we place it so
 * x' = a*x + b*y + c, y' = d*x + e*y + f, w' = g*x + h*y + 1, and leave z
 * untouched (z column = identity):
 *
 *   | a  b  0  c |
 *   | d  e  0  f |
 *   | 0  0  1  0 |
 *   | g  h  0  1 |
 *
 * Written column-by-column (CSS order) that becomes the tuple below.
 */
export function matrix3dFromHomography([a, b, c, d, e, f, g, h, i]: Mat3): string {
  return `matrix3d(${a}, ${d}, 0, ${g}, ${b}, ${e}, 0, ${h}, 0, 0, 1, 0, ${c}, ${f}, 0, ${i})`;
}
