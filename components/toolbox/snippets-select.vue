<template>
  <select multiple>
    <optgroup v-for="snippet in snippets" :label="snippet.label">
      <option v-for="option in snippet.options" :value="option.value" @dblclick="onSelect(option)">
        {{ option.label }}
      </option>
    </optgroup>
  </select>
</template>

<script setup lang="ts">

type SnippetOption = {
  label: string;
  value: string;
};

type SnippetCategory = {
  label: string;
  options: SnippetOption[];
};

const snippets: SnippetCategory[] = [
  {
    label: "Foo",
    options: [
      {
        label: "Level 1",
        value: "level1"
      },
      {
        label: "Level 2",
        value: "level2"
      }
    ]
  },
  {
    label: "Bar",
    options: [
      {
        label: "Level 6",
        value: "level6"
      },
      {
        label: "Level 7",
        value: "level7"
      }
    ]
  },
];

const onSelect = (opt: SnippetOption) => {
  alert("Not yet implemented");
}

</script>
