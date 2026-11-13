import type { Shape } from './shape'

export function isMissing(value: string | null | undefined): boolean {
  return value == null
}

export function area(shape: Shape): number {
  const { sides } = shape
  return sides * sides
}
