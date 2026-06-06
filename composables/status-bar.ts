const text = ref('');
export function useStatusBar() {
  const setText = (newText: string) => {
    text.value = newText;
  };
  return {
    text: readonly(text),
    setText,
  };
}
