import { Point } from '@/simulation/Point';

const truncPoint = (point: Point): Point => [ Math.trunc(point[0]), Math.trunc(point[1]) ];

export function traceLine(startPoint: Point, ...points: Point[]): Point[] {
  if (points.length === 0) {
    return [ startPoint ];
  }
  const result: Point[] = [];
  let lastPoint = startPoint;
  for (const point of points) {
    let [ x0, y0 ] = truncPoint(lastPoint);
    let [ x1, y1 ] = truncPoint(point);
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    while (true) {
      if (x0 === x1 && y0 === y1) {
        break;
      }
      result.push([ x0, y0 ]);
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
        continue;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
        continue;
      }
      throw new Error('Infinite loop detected');
    }
    lastPoint = point;
  }
  result.push([ ...lastPoint ]);
  return result;
}
