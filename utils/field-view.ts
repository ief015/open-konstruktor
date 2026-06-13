import type { Point } from '@/simulation';

export const TILE_SIZE = 13;

export const MIN_VIEW_SCALE = 0.35;
export const DEFAULT_VIEW_SCALE = 1;
export const MAX_VIEW_SCALE = 3.5;
export const VIEW_SCALE_STEP = 1.15;
export const WHEEL_ZOOM_SENSITIVITY = 0.0015;

export type ViewBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

export function clampViewScale(scale: number): number {
  return Math.max(MIN_VIEW_SCALE, Math.min(MAX_VIEW_SCALE, scale));
}

export function stepViewScale(
  scale: number,
  direction: 'in' | 'out',
): number {
  const factor = direction === 'in' ? VIEW_SCALE_STEP : 1 / VIEW_SCALE_STEP;
  return clampViewScale(scale * factor);
}

export function normalizeWheelDelta(deltaY: number, deltaMode: number): number {
  switch (deltaMode) {
    case 1:
      return deltaY * 16;
    case 2:
      return deltaY * 800;
    default:
      return deltaY;
  }
}

export function scaleFromWheelDelta(
  scale: number,
  deltaY: number,
  deltaMode = 0,
): number {
  const delta = normalizeWheelDelta(deltaY, deltaMode);
  return clampViewScale(scale * Math.exp(-delta * WHEEL_ZOOM_SENSITIVITY));
}

export function canvasPointerPosition(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
): Point {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return [(clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY];
}

export function computeViewBounds(
  fieldWidth: number,
  fieldHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  viewScale: number,
): ViewBounds {
  const visibleWidth = canvasWidth / viewScale;
  const visibleHeight = canvasHeight / viewScale;
  return {
    minX: Math.min(
      fieldWidth - visibleWidth + 1,
      Math.trunc(fieldWidth / 2),
      0,
    ),
    minY: Math.min(
      fieldHeight - visibleHeight + 1,
      Math.trunc(fieldHeight / 2),
      0,
    ),
    maxX: Math.max(fieldWidth - visibleWidth + 1, 0),
    maxY: Math.max(fieldHeight - visibleHeight + 1, 0),
  };
}

export function clampViewPosition(
  viewX: number,
  viewY: number,
  bounds: ViewBounds,
): Point {
  return [
    Math.max(bounds.minX, Math.min(bounds.maxX, viewX)),
    Math.max(bounds.minY, Math.min(bounds.maxY, viewY)),
  ];
}

export function computeResetViewPosition(
  fieldWidth: number,
  fieldHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  viewScale: number,
  bounds: ViewBounds,
): Point {
  const visibleWidth = canvasWidth / viewScale;
  const visibleHeight = canvasHeight / viewScale;
  const viewX =
    fieldWidth < visibleWidth
      ? Math.max(
          bounds.minX,
          Math.min(
            bounds.maxX,
            -Math.trunc((visibleWidth - fieldWidth) / 2),
          ),
        )
      : 0;
  const viewY =
    fieldHeight < visibleHeight
      ? Math.max(
          bounds.minY,
          Math.min(
            bounds.maxY,
            -Math.trunc((visibleHeight - fieldHeight) / 2),
          ),
        )
      : 0;
  return [viewX, viewY];
}

export function computeTileViewport(
  viewX: number,
  viewY: number,
  canvasWidth: number,
  canvasHeight: number,
  viewScale: number,
  columns: number,
  rows: number,
): { left: number; top: number; right: number; bottom: number } {
  const visibleWidth = canvasWidth / viewScale;
  const visibleHeight = canvasHeight / viewScale;
  const left = Math.max(0, Math.floor(viewX / TILE_SIZE));
  const top = Math.max(0, Math.floor(viewY / TILE_SIZE));
  const right =
    Math.min(columns, Math.ceil((viewX + visibleWidth) / TILE_SIZE)) - 1;
  const bottom =
    Math.min(rows, Math.ceil((viewY + visibleHeight) / TILE_SIZE)) - 1;
  return { left, top, right, bottom };
}

export function screenToField(
  mx: number,
  my: number,
  viewX: number,
  viewY: number,
  viewScale: number,
): Point {
  return [mx / viewScale + viewX, my / viewScale + viewY];
}

export function fieldToScreen(
  fx: number,
  fy: number,
  viewX: number,
  viewY: number,
  viewScale: number,
): Point {
  return [(fx - viewX) * viewScale, (fy - viewY) * viewScale];
}

export function mouseToGrid(
  mx: number,
  my: number,
  viewX: number,
  viewY: number,
  viewScale: number,
): Point {
  const [fx, fy] = screenToField(mx, my, viewX, viewY, viewScale);
  return [Math.floor(fx / TILE_SIZE), Math.floor(fy / TILE_SIZE)];
}

export function zoomAtPoint(
  viewX: number,
  viewY: number,
  viewScale: number,
  mx: number,
  my: number,
  newScale: number,
): { viewX: number; viewY: number; viewScale: number } {
  const clampedScale = clampViewScale(newScale);
  if (clampedScale === viewScale) {
    return { viewX, viewY, viewScale };
  }
  return {
    viewX: viewX + mx * (1 / viewScale - 1 / clampedScale),
    viewY: viewY + my * (1 / viewScale - 1 / clampedScale),
    viewScale: clampedScale,
  };
}

export function applyFieldViewTransform(
  ctx: CanvasRenderingContext2D,
  viewX: number,
  viewY: number,
  viewScale: number,
) {
  ctx.scale(viewScale, viewScale);
  ctx.translate(-viewX, -viewY);
}
