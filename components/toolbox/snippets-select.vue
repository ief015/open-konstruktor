<template>
  <div class="flex flex-col">
    <select multiple v-model="selected" class="flex-1">
      <optgroup v-for="snippet in snippets" :label="snippet.label">
        <option v-for="option in snippet.options" :value="option.value" @dblclick="onSelect(option)">
          {{ option.label }}
        </option>
      </optgroup>
    </select>
  <div class="flex flex-row m-1 gap-1">
    <button class="flex-1" @click="onSave" :disabled="!selectionData">Save</button>
    <button class="flex-1" @click="onLoad" :disabled="selected.length != 1">Load</button>
    <button class="flex-1" @click="onDelete" :disabled="!selected.length">Delete</button>
  </div>
  <!--div class="flex flex-row m-1 gap-1">
    <button class="flex-1" @click="onFlipHorizontal" :disabled="!selectionData">FH</button>
    <button class="flex-1" @click="onFlipVertical" :disabled="!selectionData">FV</button>
    <button class="flex-1" @click="onRotateLeft" :disabled="!selectionData">RL</button>
    <button class="flex-1" @click="onRotateRight" :disabled="!selectionData">RR</button>
  </div-->
</div>
</template>

<script setup lang="ts">

type SnippetOption = {
  id: number;
  label: string;
  value: string;
};

type SnippetCategory = {
  label: string;
  options: SnippetOption[];
};

const {
  data: selectionData,
} = useSelection();
const selected = ref<SnippetOption[]>([]);
const snippets: SnippetCategory[] = [

];

const onSelect = (opt: SnippetOption) => {
  alert("Not yet implemented");
}

const onSave = async () => {
  const name = prompt("Enter a name for this snippet:");
  if (name) {
    alert("Not yet implemented");
  }
}

const onLoad = () => {
  const opt = selected.value[0];
  if (opt) {
    alert("Not yet implemented");
  }
}

const onDelete = async () => {
  const opt = selected.value[0];
  if (opt?.id && confirm(`Are you sure you want to delete "${opt.label}"?`)) {
    alert("Not yet implemented");
  }
}

/*
const onFlipHorizontal = () => {
  if (selectionData.value) {
    selectionData.value.flipHorizontal();
  }
}

const onFlipVertical = () => {
  if (selectionData.value) {
    selectionData.value.flipVertical();
  }
}

const onRotateLeft = () => {
  alert("Not yet implemented");
}

const onRotateRight = () => {
  alert("Not yet implemented");
}
*/

</script>
