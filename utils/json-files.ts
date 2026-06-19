export function downloadJSON(
  data: unknown,
  filename: string,
  formatted: boolean = false,
) {
  if (!document) {
    throw new Error('Must be used in a browser environment');
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

export async function readFileJSON<T = unknown>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        try {
          const data = JSON.parse(text);
          resolve(data);
        } catch (e) {
          reject(
            new Error(
              `Failed to parse JSON: ${e instanceof Error ? e.message : e}`,
            ),
          );
        }
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
