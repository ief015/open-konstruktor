import { test, expect } from 'vitest';
import {
  TILE_SIZE,
  MAX_VIEW_SCALE,
  MIN_VIEW_SCALE,
  clampViewScale,
  canvasPointerPosition,
  computeResetViewPosition,
  computeTileViewport,
  computeViewBounds,
  fieldToScreen,
  mouseToGrid,
  scaleFromWheelDelta,
  screenToField,
  stepViewScale,
  zoomAtPoint,
} from '@/utils/field-view';

test('clampViewScale limits zoom range', () => {
  expect(clampViewScale(0.1)).toBe(MIN_VIEW_SCALE);
  expect(clampViewScale(10)).toBe(MAX_VIEW_SCALE);
  expect(clampViewScale(1)).toBe(1);
});

test('computeViewBounds at scale 1', () => {
  const fieldWidth = 100 * TILE_SIZE;
  const fieldHeight = 50 * TILE_SIZE;
  const canvasWidth = 800;
  const canvasHeight = 600;
  const bounds = computeViewBounds(
    fieldWidth,
    fieldHeight,
    canvasWidth,
    canvasHeight,
    1,
  );
  expect(bounds.minX).toBe(0);
  expect(bounds.minY).toBe(0);
  expect(bounds.maxX).toBe(fieldWidth - canvasWidth + 1);
  expect(bounds.maxY).toBe(fieldHeight - canvasHeight + 1);
});

test('computeViewBounds zoomed out increases pan range', () => {
  const fieldWidth = 100 * TILE_SIZE;
  const fieldHeight = 50 * TILE_SIZE;
  const canvasWidth = 800;
  const canvasHeight = 600;
  const at1 = computeViewBounds(
    fieldWidth,
    fieldHeight,
    canvasWidth,
    canvasHeight,
    1,
  );
  const atHalf = computeViewBounds(
    fieldWidth,
    fieldHeight,
    canvasWidth,
    canvasHeight,
    0.5,
  );
  expect(atHalf.maxX).toBeLessThan(at1.maxX);
  expect(atHalf.maxY).toBeLessThan(at1.maxY);
});

test('computeResetViewPosition centers a small field', () => {
  const fieldWidth = 20 * TILE_SIZE;
  const fieldHeight = 10 * TILE_SIZE;
  const canvasWidth = 800;
  const canvasHeight = 600;
  const bounds = computeViewBounds(
    fieldWidth,
    fieldHeight,
    canvasWidth,
    canvasHeight,
    1,
  );
  const [viewX, viewY] = computeResetViewPosition(
    fieldWidth,
    fieldHeight,
    canvasWidth,
    canvasHeight,
    1,
    bounds,
  );
  expect(viewX).toBe(-Math.trunc((canvasWidth - fieldWidth) / 2));
  expect(viewY).toBe(-Math.trunc((canvasHeight - fieldHeight) / 2));
});

test('mouseToGrid accounts for zoom', () => {
  const viewX = 26;
  const viewY = 13;
  const atScale1 = mouseToGrid(26, 13, viewX, viewY, 1);
  expect(atScale1).toEqual([4, 2]);
  const atScale2 = mouseToGrid(52, 26, viewX, viewY, 2);
  expect(atScale2).toEqual([4, 2]);
});

test('zoomAtPoint keeps the cursor anchor fixed', () => {
  const viewX = 100;
  const viewY = 50;
  const viewScale = 1;
  const mx = 200;
  const my = 150;
  const before = screenToField(mx, my, viewX, viewY, viewScale);
  const zoomed = zoomAtPoint(viewX, viewY, viewScale, mx, my, 0.5);
  const after = screenToField(
    mx,
    my,
    zoomed.viewX,
    zoomed.viewY,
    zoomed.viewScale,
  );
  expect(after[0]).toBeCloseTo(before[0]);
  expect(after[1]).toBeCloseTo(before[1]);
});

test('zoomAtPoint keeps anchor with non-zero pan', () => {
  const viewX = 260;
  const viewY = 130;
  const viewScale = 1.5;
  const mx = 400;
  const my = 300;
  const before = screenToField(mx, my, viewX, viewY, viewScale);
  const zoomed = zoomAtPoint(viewX, viewY, viewScale, mx, my, 2);
  const after = screenToField(
    mx,
    my,
    zoomed.viewX,
    zoomed.viewY,
    zoomed.viewScale,
  );
  expect(after[0]).toBeCloseTo(before[0]);
  expect(after[1]).toBeCloseTo(before[1]);
});

test('fieldToScreen and screenToField are inverse', () => {
  const viewX = 260;
  const viewY = 130;
  const viewScale = 1.5;
  const field = [520, 390] as const;
  const [mx, my] = fieldToScreen(field[0], field[1], viewX, viewY, viewScale);
  const back = screenToField(mx, my, viewX, viewY, viewScale);
  expect(back[0]).toBeCloseTo(field[0]);
  expect(back[1]).toBeCloseTo(field[1]);
});

test('canvasPointerPosition maps CSS coords to canvas buffer coords', () => {
  const canvas = {
    width: 800,
    height: 600,
    getBoundingClientRect: () => ({
      left: 10,
      top: 20,
      width: 400,
      height: 300,
    }),
  } as HTMLCanvasElement;
  expect(canvasPointerPosition(canvas, 110, 120)).toEqual([200, 200]);
});

test('computeTileViewport grows when zoomed out', () => {
  const columns = 100;
  const rows = 50;
  const canvasWidth = 800;
  const canvasHeight = 600;
  const at1 = computeTileViewport(
    0,
    0,
    canvasWidth,
    canvasHeight,
    1,
    columns,
    rows,
  );
  const atHalf = computeTileViewport(
    0,
    0,
    canvasWidth,
    canvasHeight,
    0.5,
    columns,
    rows,
  );
  expect(atHalf.right - atHalf.left).toBeGreaterThan(at1.right - at1.left);
});

test('stepViewScale and wheel delta change zoom', () => {
  expect(stepViewScale(1, 'in')).toBeGreaterThan(1);
  expect(stepViewScale(1, 'out')).toBeLessThan(1);
  expect(stepViewScale(0.5, 'in')).toBeGreaterThan(0.5);
  expect(scaleFromWheelDelta(1, -100)).toBeGreaterThan(1);
  expect(scaleFromWheelDelta(1, 100)).toBeLessThan(1);
});
