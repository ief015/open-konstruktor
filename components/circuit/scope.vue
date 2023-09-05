<template>
  <div class="flex flex-col" :style="{ 'background-color': COLOR_CHART }">
    <div
      ref="canvasContainer"
      :class="`relative m-[8px] overflow-auto max-h-[${maxScopeHeight}px]`"
    >
      <canvas
        ref="canvas"
        class="relative inset-0"
        @mousemove="onMouseMove"
        @mousedown="onMouseDown"
        @mouseup="onMouseUp"
        oncontextmenu="return false;"
      >
        Your browser must support the canvas tag.
      </canvas>
    </div>
    <div class="px-[8px] flex flex-row justify-between items-baseline text-black">
      <div
        class="font-georgia12 text-[12px] uppercase"
      >
        <span v-if="isRunning">
          VERIFICATION TEST RUNNING... {{ currentFrame }}
        </span>
        <span v-else-if="!verifyResult">
          VERIFICATION TEST NOT YET COMPLETED
        </span>
        <span v-else-if="verifyResult.gradePercent >= 97" :style="{ 'color': COLOR_VERIFY_PASS }">
          VERIFICATION TEST PASSED ({{verifyResult.gradePercent}}%) - FLAGGED AS COMPLETED
        </span>
        <span v-else :style="{ 'color': COLOR_VERIFY_FAIL }">
          VERIFICATION TEST FAILED ({{verifyResult.gradePercent}}%) 
        </span>
      </div>
      <div class="font-georgia10 text-[10px] min-w-[20em]">
        DESIGN SCORE (lower is better): {{ designScore }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PinNode, Point, VerificationResult } from '@/simulation'; 

type DrawMode = 'high' | 'low';

const COLOR_CHART = '#FFF7E2';
const COLOR_SCOPE_LINE = '#000';
const COLOR_SCOPE_HINT = '#888';
const COLOR_SCOPE_TIME_LINE = '#F00';
const COLOR_GRID_LINE = '#BFBBB1';
const COLOR_VERIFY_PASS = '#080';
const COLOR_VERIFY_FAIL = '#800';
const TICK_WIDTH_PX = 2; // 2px per tick
const HEIGHT_PX_SCOPE = 25; // 25px per scope
const GRID_LINE_INTERVAL = 5; // Grid line every 5 ticks
const WIDTH_PX_LABELS = 52; // Minimum width for labels

const canvasContainer = ref<HTMLDivElement>();
const canvas = ref<HTMLCanvasElement>();
let ctx: CanvasRenderingContext2D | null = null;

const { designScore } = useFieldGraph();
const {
  network, sim, isRunning, currentFrame,
  onRender: onCircuitRender, onComplete,
} = useCircuitSimulator();
const isDrawing = ref(false);
const drawMode = ref<DrawMode>('high');
let prevDrawingCoords: Point = [0, 0];
const verifyResult = ref<VerificationResult>();

const filteredPins = computed(() => {
  const pins = network.value.getPinNodes();
  return pins.filter((node, idx) => idx > 1 && idx < pins.length - 2);
})
const maxScopeHeight = computed(() => {
  return filteredPins.value.length * HEIGHT_PX_SCOPE;
});

const renderScope = () => {
  if (!ctx) return;
  const vsim = sim.value;

  ctx.resetTransform();
  ctx.translate(0.5, 0.25);
  ctx.fillStyle = COLOR_CHART;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.lineWidth = 1;

  const runningLength = vsim.getRunningLength();
  const scopeWidth = runningLength * TICK_WIDTH_PX;
  const currentX = vsim.getRecordingLength() * TICK_WIDTH_PX;

  // draw grid lines
  ctx.strokeStyle = COLOR_GRID_LINE;
  ctx.save();
  ctx.setLineDash([ 2, 1 ]);
  ctx.translate(WIDTH_PX_LABELS, 0);
  ctx.beginPath();
  for (let i = 0; i <= runningLength; i += GRID_LINE_INTERVAL) {
    ctx.moveTo(i * TICK_WIDTH_PX, 0);
    ctx.lineTo(i * TICK_WIDTH_PX, ctx.canvas.height);
  }
  ctx.stroke();
  ctx.restore();

  // draw scopes for each pin from top to bottom
  const pins = filteredPins.value;
  ctx.save();
  ctx.strokeStyle = COLOR_SCOPE_LINE;
  ctx.fillStyle = COLOR_SCOPE_LINE;
  for (const offset of [ 0, 1 ]) {
    const baseline = -(HEIGHT_PX_SCOPE / 4 + 0.5);
    const highLine = baseline - Math.floor(HEIGHT_PX_SCOPE / 2);
    for (let i = offset; i < pins.length; i += 2) {
      const pin = pins[i];
      const { input, output } = vsim.getSequence(pin);
      ctx.translate(0, HEIGHT_PX_SCOPE);

      // draw label
      ctx.beginPath();
      ctx.moveTo(0, baseline);
      ctx.lineTo(WIDTH_PX_LABELS, baseline);
      ctx.stroke();
      if (pin.label) {
        ctx.font = '10px Georgia10';
        ctx.fillText(pin.label, -0.5, baseline - 4, WIDTH_PX_LABELS);
      }

      // draw scopes on graph
      ctx.save();
      ctx.translate(WIDTH_PX_LABELS, 0);
      if (input) {
        ctx.strokeStyle = COLOR_SCOPE_LINE;

        ctx.beginPath();
        ctx.moveTo(0, baseline);
        let i = 0;
        let lastY = baseline;
        for (const state of input) {
          const x = i * TICK_WIDTH_PX;
          const y = (state ? highLine : baseline);
          ctx.lineTo(x, y);
          ctx.lineTo(x + TICK_WIDTH_PX, y);
          i++;
          lastY = y;
        }
        ctx.lineTo(scopeWidth, lastY);
        ctx.stroke();

      } else if (output) {

        // expected
        ctx.strokeStyle = COLOR_SCOPE_HINT;
        ctx.beginPath();
        ctx.moveTo(0, baseline);
        let i = 0;
        let lastY = baseline;
        for (const state of output) {
          const x = i * TICK_WIDTH_PX;
          const y = (state ? highLine : baseline);
          ctx.lineTo(x, y);
          ctx.lineTo(x + TICK_WIDTH_PX, y);
          i++;
          lastY = y;
        }
        ctx.lineTo(scopeWidth, lastY);
        ctx.stroke();

        // actual
        const rec = vsim.getRecording(pin);
        if (rec) {
          ctx.strokeStyle = COLOR_SCOPE_LINE;
          ctx.beginPath();
          ctx.moveTo(0, baseline);
          let i = 0;
          let lastY = baseline;
          for (const state of rec) {
            const x = i * TICK_WIDTH_PX;
            const y = (state ? highLine : baseline);
            ctx.lineTo(x, y);
            ctx.lineTo(x + TICK_WIDTH_PX, y);
            i++;
            lastY = y;
          }
          ctx.lineTo(currentX, lastY);
          ctx.stroke();
        }

      } else { // N/C
        ctx.beginPath();
        ctx.moveTo(0, baseline);
        ctx.lineTo(scopeWidth, baseline);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  ctx.restore();

  // draw current time line
  if (isRunning.value) {
    ctx.strokeStyle = COLOR_SCOPE_TIME_LINE;
    ctx.beginPath();
    ctx.moveTo(WIDTH_PX_LABELS + currentX, 0);
    ctx.lineTo(WIDTH_PX_LABELS + currentX, ctx.canvas.height);
    ctx.stroke();
  }
}

const draw = (mode: DrawMode, coordA: Point, coordB: Point) => {
  if (isRunning.value) return;
  // TODO: implement
  // renderScope();
}

const mouseToGrid = (mx: number, my: number): Point => {
  if (!ctx) return [0, 0];
  const rect = ctx.canvas.getBoundingClientRect();
  const x = Math.trunc((mx - rect.left) / 12);
  const y = Math.trunc((my - rect.top) / 12);
  return [x, y];
}

const onMouseMove = (e: MouseEvent) => {
  if (!ctx) return;
  if (isRunning.value) return;
  if (isDrawing.value) {
    const coords = mouseToGrid(e.clientX, e.clientY);
    draw(drawMode.value, prevDrawingCoords, coords);
    prevDrawingCoords = coords;
  }
}

const onMouseDown = (e: MouseEvent) => {
  if (!ctx) return;
  if (isRunning.value) return;
  if (e.button === 0) {
    drawMode.value = 'high';
  } else if (e.button === 2) {
    drawMode.value = 'low';
  } else {
    return;
  }
  isDrawing.value = true;
  prevDrawingCoords = mouseToGrid(e.clientX, e.clientY);
  draw(drawMode.value, prevDrawingCoords, prevDrawingCoords);
}

const onMouseUp = (e: MouseEvent) => {
  if (!ctx) return;
  if (isRunning.value) return;
  isDrawing.value = false;
}

const onResize = () => {
  if (!ctx || !canvasContainer.value)
    return;
  ctx.canvas.width = Math.trunc(canvasContainer.value.clientWidth);
  ctx.canvas.height = maxScopeHeight.value;
  renderScope();
}

onCircuitRender(renderScope);

onComplete((result) => {
  verifyResult.value = result;
});

watch(isRunning, (running) => {
  if (running) {
    isDrawing.value = false;
    verifyResult.value = undefined;
  }
  renderScope();
});

watch(sim, (sim) => {
  verifyResult.value = undefined;
  renderScope();
});

watch(network, (network) => {
  onResize();
});

useResizeObserver(canvasContainer, () => onResize());

onMounted(async () => {
  ctx = canvas.value?.getContext('2d') ?? null;
  if (!ctx) throw new Error('Could not get canvas context');
  ctx.imageSmoothingEnabled = false;
  onResize();
  window.addEventListener('resize', onResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
});

</script>
