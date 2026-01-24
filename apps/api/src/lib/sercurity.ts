export function delayGenerator(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
