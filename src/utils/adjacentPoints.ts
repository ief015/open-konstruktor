import { Point } from '@/simulation';

export function adjacentPoints(point: Point): Point[] {
  const [ x, y ] = point;
  return [
    [ x - 1, y ],
    [ x + 1, y ],
    [ x, y - 1 ],
    [ x, y + 1 ],
  ];
}
