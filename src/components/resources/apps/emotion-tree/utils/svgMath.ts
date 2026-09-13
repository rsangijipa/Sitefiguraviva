export interface Point {
  x: number;
  y: number;
}

/**
 * Converts polar coordinates to Cartesian coordinates in SVG space.
 * 0 degrees corresponds to top (12 o'clock).
 */
export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
): Point {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: Number((centerX + radius * Math.cos(angleInRadians)).toFixed(3)),
    y: Number((centerY + radius * Math.sin(angleInRadians)).toFixed(3)),
  };
}

/**
 * Generates an SVG path data string for an annular sector (donut slice).
 */
export function describeAnnularSector(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number,
): string {
  // Clamp angles
  let start = startAngle;
  let end = endAngle;
  if (end - start >= 360) {
    end = start + 359.999;
  }

  const p1 = polarToCartesian(cx, cy, rOuter, start);
  const p2 = polarToCartesian(cx, cy, rOuter, end);
  const p3 = polarToCartesian(cx, cy, rInner, end);
  const p4 = polarToCartesian(cx, cy, rInner, start);

  const largeArcFlag = end - start <= 180 ? "0" : "1";

  return [
    "M",
    p1.x,
    p1.y,
    "A",
    rOuter,
    rOuter,
    0,
    largeArcFlag,
    1,
    p2.x,
    p2.y,
    "L",
    p3.x,
    p3.y,
    "A",
    rInner,
    rInner,
    0,
    largeArcFlag,
    0,
    p4.x,
    p4.y,
    "Z",
  ].join(" ");
}

/**
 * Computes offset coordinates for a selected segment (radial pop-out).
 */
export function computeRadialOffset(
  midAngleInDegrees: number,
  distance: number,
): Point {
  const angleInRadians = ((midAngleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: Number((distance * Math.cos(angleInRadians)).toFixed(2)),
    y: Number((distance * Math.sin(angleInRadians)).toFixed(2)),
  };
}

/**
 * Determines text rotation angle so text is never upside down.
 */
export function calculateTextRotation(angleInDegrees: number): number {
  const normalized = ((angleInDegrees % 360) + 360) % 360;
  // If angle is in bottom half (between 90 and 270), flip by 180
  if (normalized > 90 && normalized < 270) {
    return normalized + 180;
  }
  return normalized;
}
