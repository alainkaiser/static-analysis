export function readLabel(cached: string | undefined): Promise<string> {
  return new Promise((resolve) => {
    if (cached !== undefined) return cached
    resolve('fresh')
  })
}
