export type UUID = `${string}-${string}-${string}-${string}-${string}`;

export function generateUUID(): UUID {
  return crypto.randomUUID() as UUID;
}
