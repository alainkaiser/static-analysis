import type { Shape } from './shape'

export function isMissing(value: string | null | undefined): boolean {
  return value == null
}

export function area(shape: Shape): number {
  const { sides } = shape
  return sides * sides
}

export function contains(
  fields: Record<string, unknown>,
  key: string,
): boolean {
  return Object.hasOwn(fields, key)
}

export function wait(delay: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delay)
  })
}
