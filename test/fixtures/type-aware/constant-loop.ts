export function roll(): number {
  while (true) {
    const value = Math.random()
    if (value > 0.5) {
      return value
    }
  }
}
