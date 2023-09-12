import { Point } from '@/simulation';

const truncPoint = (point: Point): Point => [ Math.trunc(point[0]), Math.trunc(point[1]) ];

export function traceRectBorder(start: Point, end: Point): Point[] {
  const [ x1, y1 ] = truncPoint(start);
  const [ x2, y2 ] = truncPoint(end);
  const minX = Math.min(x1, x2);
  const minY = Math.min(y1, y2);
  const maxX = Math.max(x1, x2);
  const maxY = Math.max(y1, y2);
  return traceLine(
    [ minX, minY ],
    [ maxX, minY ],
    [ maxX, maxY ],
    [ minX, maxY ],
    [ minX, minY + 1 ],
  ); 
}
