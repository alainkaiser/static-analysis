const prices: Record<string, number> = { apple: 1 }

export function price(name: string): number {
  const found = prices[name]
  if (found === undefined) {
    return 0
  }
  return found
}
