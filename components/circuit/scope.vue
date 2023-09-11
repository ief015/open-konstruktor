<template>
  <div class="flex flex-col" :style="{ 'background-color': COLOR_CHART }">
    <div
      ref="canvasContainer"
      :class="`m-[8px] overflow-auto max-h-[${maxScopeHeight}px]`"
    >
      <canvas
        ref="canvas"
        class="w-full h-full"
        @mousemove="onMouseMove"
        @mousedown="onMouseDown"
        @mouseup="onMouseUp"
        oncontextmenu="return false;"
      >
        Your browser must support the canvas tag.
      </canvas>
    </div>
    <div class="px-[8px] flex flex-row justify-between items-end text-black">
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
const canvasWidth = ref(0);
const { designScore } = useFieldGraph();
const {
  network, sim, isRunning, currentFrame,
  onRender: onCircuitRender, onComplete,
} = useCircuitSimulator();
const isDrawing = ref(false);
const drawMode = ref<DrawMode>('high');
let prevDrawingCoords: Point = [0, 0];
const verifyResult = ref<VerificationResult>();
const filteredPins = computed<PinNode[]>(() => {
  const pins = network.value.getPinNodes();
  // TODO: need a more proper way to filter out VCC (flag on PinNode?)
  return pins.filter((node, idx) => node.label !== 'VCC');
})
const maxScopeHeight = computed<number>(() => {
  return filteredPins.value.length * HEIGHT_PX_SCOPE;
});
const translateX = computed<number>(() => {
  if (!canvas.value) return 0;
  const padLength = (WIDTH_PX_LABELS / TICK_WIDTH_PX);
  const visibleFrameLength = (canvasWidth.value / TICK_WIDTH_PX);
  const endPos = sim.value.getRunningLength() + padLength;
  if (endPos <= visibleFrameLength) return 0;
  const curPos = currentFrame.value + padLength;
  const center = visibleFrameLength / 2;
  return Math.max(0, Math.min(endPos - visibleFrameLength + 1, curPos - center)) * TICK_WIDTH_PX;
});

const renderScope = () => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  const vsim = sim.value;

  ctx.save();
  ctx.fillStyle = COLOR_CHART;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.translate(0.5, 0.25);
  ctx.translate(-translateX.value, 0);
  ctx.lineWidth = 1;

  const runningLength = vsim.getRunningLength();
  const scopeWidth = runningLength * TICK_WIDTH_PX;
  const currentX = vsim.getRecordingLength() * TICK_WIDTH_PX;

  // draw grid lines
  ctx.strokeStyle = COLOR_GRID_LINE;
  ctx.save();
  {
    ctx.setLineDash([ 2, 1 ]);
    ctx.translate(WIDTH_PX_LABELS, 0);
    ctx.beginPath();
    for (let i = 0; i <= runningLength; i += GRID_LINE_INTERVAL) {
      ctx.moveTo(i * TICK_WIDTH_PX, 0);
      ctx.lineTo(i * TICK_WIDTH_PX, ctx.canvas.height);
    }
    ctx.stroke();
  }
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
        ctx.save();
        ctx.translate(translateX.value, 0);
        ctx.font = '10px Georgia10';
        ctx.fillText(pin.label, -0.5, baseline - 4, WIDTH_PX_LABELS);
        ctx.restore();
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

  ctx.restore();
}

const draw = (mode: DrawMode, coordA: Point, coordB: Point) => {
  if (isRunning.value) return;
  // TODO: implement
  // renderScope();
}

const mouseToGrid = (mx: number, my: number): Point => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  const rect = ctx.canvas.getBoundingClientRect();
  const x = Math.trunc((mx - rect.left) / 12);
  const y = Math.trunc((my - rect.top) / 12);
  return [x, y];
}

const onMouseMove = (e: MouseEvent) => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  if (isRunning.value) return;
  if (isDrawing.value) {
    const coords = mouseToGrid(e.clientX, e.clientY);
    draw(drawMode.value, prevDrawingCoords, coords);
    prevDrawingCoords = coords;
  }
}

const onMouseDown = (e: MouseEvent) => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
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
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  if (isRunning.value) return;
  isDrawing.value = false;
}

const onResize = () => {
  if (!canvas.value) throw new Error('Could not get canvas element');
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  ctx.canvas.width = Math.trunc(canvas.value.clientWidth);
  canvasWidth.value = ctx.canvas.width;
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
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  ctx.imageSmoothingEnabled = false;
  onResize();
  window.addEventListener('resize', onResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
});

</script>
