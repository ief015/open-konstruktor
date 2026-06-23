<template>
  <div :style="{ 'background-color': COLOR_CHART }">
    <div
      ref="canvasContainer"
      class="p-[8px] overflow-auto relative"
      :style="{
        minHeight: `${minScopeHeight}px`,
        maxHeight: `${maxScopeHeight}px`,
      }"
    >
      <canvas
        ref="canvas"
        class="w-full block"
        :style="{
          height: `${scopeHeight}px`,
        }"
      >
        Your browser must support the canvas tag.
      </canvas>
      <div
        class="absolute top-0 right-0 flex flex-row items-center"
        title="Edit verification graph. Left click = draw, Right click = erase"
        v-if="!isRunning"
      >
        <label
          for="scope-edit-checkbox"
          class="font-georgia12 text-[12px] text-black"
        >
          Edit
        </label>
        <input type="checkbox" id="scope-edit-checkbox" v-model="editable" />
      </div>
    </div>
    <div class="mx-[8px] flex flex-row justify-between items-end text-black">
      <div
        class="font-georgia12 text-[12px] uppercase"
        :style="{ color: verificationMessageColor }"
      >
        {{ verificationMessage }}
      </div>
      <div class="font-georgia10 text-[10px] flex flex-row gap-4 items-end">
        <div v-if="verificationResult">
          GRADE:
          <span
            class="text-bold"
            :style="{
              color: verificationResult.passed
                ? COLOR_VERIFY_PASS
                : COLOR_VERIFY_FAIL,
            }"
          >
            {{ verificationResult.gradePercent }}%
          </span>
        </div>
        <div class="min-w-[20em]">
          DESIGN SCORE (lower is better): {{ designScore }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  PinNode,
  Sequence,
  Point,
  VerificationResult,
} from '@/simulation';

type DrawMode = 'high' | 'low';

const COLOR_CHART = '#FFF7E2';
const COLOR_SCOPE_LINE = '#000';
const COLOR_SCOPE_HINT = '#888';
const COLOR_SCOPE_TIME_LINE = '#F00';
const COLOR_GRID_LINE = '#BFBBB1';
const COLOR_VERIFY_PASS = '#080';
const COLOR_VERIFY_FAIL = '#800';
const SCOPE_SCALE_X = 2; // 2px per tick
const SCOPE_ROW_HEIGHT_PX = 25; // 25px per scope row
const SCOPE_LABEL_WIDTH_PX = 52; // Minimum width for labels
const GRID_LINE_INTERVAL = 5; // Grid line every 5 ticks
const FONT = '10px Georgia10';

const canvasContainer = useTemplateRef('canvasContainer');
const canvas = useTemplateRef('canvas');
const canvasWidth = ref(0);
const {
  designScore,
  setVerificationResult,
  resetVerificationResult,
  verificationResult,
} = useFieldGraph();
const { network, sim, isRunning, currentFrame, onStepAnim, onComplete } =
  useCircuitSimulator();
const {
  openCompleted: levelInfoOpenCompleted,
  completedAvailable: hasOpenedCompleted,
} = useLevelInfo();
const isDrawing = ref(false);
const drawMode = ref<DrawMode>('high');
const editable = ref(false);
let prevDrawingCoords: Point = [0, 0];
const verifyResult = ref<VerificationResult>();
const filteredPins = computed<PinNode[]>(() => {
  const pins = network.value.getPinNodes();
  return pins.filter((node) => !node.isVCC);
});
const numRows = computed(() => {
  return filteredPins.value.length + sim.value.getProbes().length;
});
const scopeHeight = computed<number>(() => {
  return numRows.value * SCOPE_ROW_HEIGHT_PX;
});
const maxScopeHeight = computed<number>(() => {
  return 8 * SCOPE_ROW_HEIGHT_PX;
});
const minScopeHeight = computed<number>(() => {
  return 4 * SCOPE_ROW_HEIGHT_PX;
});
const translateX = computed<number>(() => {
  if (!canvas.value) return 0;
  const padLength = SCOPE_LABEL_WIDTH_PX / SCOPE_SCALE_X;
  const visibleFrameLength = canvasWidth.value / SCOPE_SCALE_X;
  const endPos = sim.value.getRunningLength() + padLength;
  if (endPos <= visibleFrameLength) return 0;
  const curPos = currentFrame.value + padLength;
  const center = visibleFrameLength / 2;
  return (
    Math.max(0, Math.min(endPos - visibleFrameLength + 1, curPos - center)) *
    SCOPE_SCALE_X
  );
});

const canEdit = computed(() => {
  return !isRunning.value && editable.value;
});

const verificationMessage = computed<string>(() => {
  if (isRunning.value) {
    return `Verification test is running... ${currentFrame.value}`;
  } else if (!verifyResult.value) {
    return 'Verification test not yet completed';
  } else if (verifyResult.value.passed) {
    return `Verification test passed (${verifyResult.value.gradePercent}%) - flagged as completed`;
  } else {
    return `Verification test failed (${verifyResult.value.gradePercent}%)`;
  }
});

const verificationMessageColor = computed<string>(() => {
  if (!verifyResult.value) return '#000';
  return verifyResult.value.passed ? COLOR_VERIFY_PASS : COLOR_VERIFY_FAIL;
});

function rowToPinIndex(row: number): number {
  const half = Math.floor(filteredPins.value.length / 2);
  if (row < half) {
    return row * 2;
  } else {
    return (row - half) * 2 + 1;
  }
}

function getContext(): CanvasRenderingContext2D {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  return ctx;
}

function updateCanvasSize() {
  const ctx = getContext();
  ctx.canvas.width = Math.trunc(ctx.canvas.clientWidth);
  canvasWidth.value = ctx.canvas.width;
  ctx.canvas.height = scopeHeight.value;
  renderScope();
}

function renderScope() {
  const ctx = getContext();
  const vsim = sim.value;
  const recorder = vsim.getRecorder();
  const runningLength = vsim.getRunningLength();
  const scopeWidth = runningLength * SCOPE_SCALE_X;
  const currentX = recorder.getRecordingLength() * SCOPE_SCALE_X;

  ctx.save();
  ctx.fillStyle = COLOR_CHART;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.translate(0.5, 0.25); // Sharpens lines
  ctx.translate(-translateX.value, 0); // Translate for horizontal autoscrolling
  ctx.lineWidth = 1;

  ctx.save();
  {
    // draw grid lines
    ctx.strokeStyle = COLOR_GRID_LINE;
    ctx.setLineDash([2, 1]);
    ctx.translate(SCOPE_LABEL_WIDTH_PX, 0);
    ctx.beginPath();
    for (let i = 0; i <= runningLength; i += GRID_LINE_INTERVAL) {
      ctx.moveTo(i * SCOPE_SCALE_X, 0);
      ctx.lineTo(i * SCOPE_SCALE_X, ctx.canvas.height);
    }
    ctx.stroke();
  }
  ctx.restore();

  const baseline = -(SCOPE_ROW_HEIGHT_PX / 4 + 0.5);
  const highLine = baseline - Math.floor(SCOPE_ROW_HEIGHT_PX / 2);

  function strokeSequenceLine(
    seq: Readonly<Sequence> | Readonly<Sequence>[] | null,
    endX: number = scopeWidth,
  ) {
    if (seq) {
      ctx.beginPath();
      ctx.moveTo(0, baseline);
      let lastY = baseline;
      seq = Array.isArray(seq) ? seq[0] : seq;
      const frames = seq.getFrames();
      for (const frame in frames) {
        const state = frames[frame];
        if (state === undefined) continue;
        const x = Number(frame) * SCOPE_SCALE_X;
        const y = state ? highLine : baseline;
        ctx.lineTo(x, lastY);
        ctx.lineTo(x, y);
        ctx.lineTo(x + SCOPE_SCALE_X, y);
        lastY = y;
      }
      ctx.lineTo(endX, lastY);
      ctx.stroke();
      // TODO: this supports multiple sequences, but could use some refactoring for efficiency
      // Currently unneeded as multiple sequences per pin are not currently used
      /*
      ctx.beginPath();
      ctx.moveTo(0, baseline);
      let lastY = baseline;
      seq = Array.isArray(seq) ? seq : [seq];
      const maxLength = Math.max(...seq.map((s) => s.getLength()));
      const frames = seq.map((s) => s.getFrames());
      for (let i = 0; i < maxLength; i++) {
        const states = frames.map((f) => f[i]).filter((s) => s !== undefined);
        if (states.length === 0) continue;
        const state = states.some((s) => s === true);
        const x = i * SCOPE_SCALE_X;
        const y = state ? highLine : baseline;
        ctx.lineTo(x, lastY);
        ctx.lineTo(x, y);
        ctx.lineTo(x + SCOPE_SCALE_X, y);
        lastY = y;
      }
      ctx.lineTo(endX, lastY);
      ctx.stroke();
      */
    } else {
      // N/C
      ctx.beginPath();
      ctx.moveTo(0, baseline);
      ctx.lineTo(scopeWidth, baseline);
      ctx.stroke();
    }
  }

  ctx.save();
  {
    // draw scopes for each pin from top to bottom
    const pins = filteredPins.value;
    ctx.fillStyle = COLOR_SCOPE_LINE;
    for (const offset of [0, 1]) {
      for (let i = offset; i < pins.length; i += 2) {
        const pin = pins[i];
        const { input, output } = vsim.getPinSequence(pin);
        ctx.translate(0, SCOPE_ROW_HEIGHT_PX);
        // draw label
        ctx.strokeStyle = COLOR_SCOPE_LINE;
        ctx.beginPath();
        ctx.moveTo(0, baseline);
        ctx.lineTo(SCOPE_LABEL_WIDTH_PX, baseline);
        ctx.stroke();
        if (pin.label) {
          ctx.save();
          ctx.translate(translateX.value, 0);
          ctx.font = FONT;
          ctx.fillText(pin.label, -0.5, baseline - 4, SCOPE_LABEL_WIDTH_PX);
          ctx.restore();
        }
        // draw scopes on graph
        ctx.save();
        ctx.translate(SCOPE_LABEL_WIDTH_PX, 0);
        if (input) {
          // input signal
          ctx.strokeStyle = COLOR_SCOPE_LINE;
          strokeSequenceLine(input);
        } else if (output) {
          // expected output signal
          ctx.strokeStyle = COLOR_SCOPE_HINT;
          strokeSequenceLine(output);
          // recorded output signal
          const rec = vsim.getPinRecording(pin);
          if (rec) {
            ctx.strokeStyle = COLOR_SCOPE_LINE;
            strokeSequenceLine(rec, currentX);
          }
        } else {
          strokeSequenceLine(null);
        }
        ctx.restore();
      }
    }
    // draw scopes for probed paths
    ctx.strokeStyle = COLOR_SCOPE_LINE;
    for (const probe of vsim.getProbes()) {
      const rec = vsim.getProbeRecording(probe);
      if (rec) {
        ctx.translate(0, SCOPE_ROW_HEIGHT_PX);
        if (probe.label) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(0, baseline);
          ctx.lineTo(SCOPE_LABEL_WIDTH_PX, baseline);
          ctx.stroke();
          ctx.translate(translateX.value, 0);
          ctx.font = FONT;
          ctx.fillText(probe.label, -0.5, baseline - 4, SCOPE_LABEL_WIDTH_PX);
          ctx.restore();
        }
        ctx.save();
        ctx.translate(SCOPE_LABEL_WIDTH_PX, 0);
        strokeSequenceLine(rec, currentX);
        ctx.restore();
      }
    }
  }
  ctx.restore();

  // draw current time line
  if (isRunning.value) {
    ctx.strokeStyle = COLOR_SCOPE_TIME_LINE;
    ctx.beginPath();
    ctx.moveTo(SCOPE_LABEL_WIDTH_PX + currentX, 0);
    ctx.lineTo(SCOPE_LABEL_WIDTH_PX + currentX, ctx.canvas.height);
    ctx.stroke();
  }

  ctx.restore();
}

function addPulse(seq: Sequence, start: number, end: number, state: boolean) {
  if (!canEdit.value) return;
  const len = sim.value.getRunningLength();
  if (end < len && seq.probe(end) !== state) {
    seq.setFrame(end, !state);
  }
  if (start < len) {
    seq.setFrame(start, state);
  }
}

function draw(mode: DrawMode, coordA: Point, coordB: Point) {
  if (!canEdit.value) return;
  const minX = Math.min(coordA[0], coordB[0]);
  const maxX = Math.max(coordA[0], coordB[0]);
  const minY = Math.min(coordA[1], coordB[1]);
  const maxY = Math.max(coordA[1], coordB[1]);
  const numPins = filteredPins.value.length;
  const len = sim.value.getRunningLength();
  for (let y = Math.max(minY, 0); y <= Math.min(maxY, numPins - 1); y++) {
    const pin = filteredPins.value[rowToPinIndex(y)];
    if (!pin) continue;
    const { input, output } = sim.value.getPinSequence(pin);
    const seq = input || output;
    if (!seq) continue;
    for (
      let x = Math.max(minX, 0);
      x <= Math.min(maxX, len - 1);
      x += GRID_LINE_INTERVAL
    ) {
      const state = mode === 'high' ? true : false;
      const end = x + GRID_LINE_INTERVAL;
      addPulse(seq as Sequence, x, end, state);
    }
  }
  renderScope();
}

function mouseToGrid(mx: number, my: number, xInterval = 1): Point {
  const ctx = getContext();
  const rect = ctx.canvas.getBoundingClientRect();
  const rx = mx - rect.left - SCOPE_LABEL_WIDTH_PX + translateX.value;
  const ry = my - rect.top;
  const x = Math.trunc(rx / (SCOPE_SCALE_X * xInterval)) * xInterval;
  const y = Math.trunc(ry / SCOPE_ROW_HEIGHT_PX);
  return [x, y];
}

onStepAnim(() => renderScope());

onComplete((result) => {
  verifyResult.value = result;
  if (result) {
    setVerificationResult(result);
    if (result.passed && !hasOpenedCompleted.value) {
      levelInfoOpenCompleted();
    }
  } else {
    resetVerificationResult();
  }
});

useEventListener(canvas, 'mousemove', (e) => {
  if (isRunning.value) return;
  if (isDrawing.value) {
    const coords = mouseToGrid(e.clientX, e.clientY, GRID_LINE_INTERVAL);
    draw(drawMode.value, prevDrawingCoords, coords);
    prevDrawingCoords = coords;
  }
});

useEventListener(canvas, 'mousedown', (e) => {
  if (isRunning.value) return;
  if (e.button === 0) {
    drawMode.value = 'high';
  } else if (e.button === 2) {
    drawMode.value = 'low';
  } else {
    return;
  }
  isDrawing.value = true;
  prevDrawingCoords = mouseToGrid(e.clientX, e.clientY, GRID_LINE_INTERVAL);
  draw(drawMode.value, prevDrawingCoords, prevDrawingCoords);
});

useEventListener(canvas, 'mouseup', (e) => {
  if (isRunning.value) return;
  isDrawing.value = false;
});

useEventListener(canvas, 'contextmenu', (e) => {
  e.preventDefault();
});

watch(isRunning, (running) => {
  if (running) {
    isDrawing.value = false;
    resetVerificationResult();
    verifyResult.value = undefined;
  }
  renderScope();
});

watch(sim, (sim) => {
  verifyResult.value = undefined;
  resetVerificationResult();
  renderScope();
});

watch(network, (network) => updateCanvasSize());

useResizeObserver(canvasContainer, (e, o) => updateCanvasSize());
useEventListener('resize', (e) => updateCanvasSize());

onMounted(async () => {
  const ctx = getContext();
  ctx.imageSmoothingEnabled = false;
  updateCanvasSize();
});
</script>
