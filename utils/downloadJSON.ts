export function downloadJSON(
  data: unknown,
  filename: string,
  formatted: boolean = false,
) {
  if (!document) {
    throw new Error('downloadJSON can only be used in a browser environment');
  }
  const json = formatted ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
}
