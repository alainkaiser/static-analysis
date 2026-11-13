declare module 'react' {
  export function useState<S>(initial: S): [S, (next: S) => void]
  export function useEffect(effect: () => void, deps?: readonly unknown[]): void
  export function useMemo<T>(factory: () => T, deps: readonly unknown[]): T
  export function useRef<T>(initial: T): { current: T }
}

declare module 'react/jsx-runtime' {
  export namespace JSX {
    type Element = unknown
    interface IntrinsicElements {
      [tag: string]: Record<string, unknown>
    }
  }
  export function jsx(type: unknown, props: unknown, key?: unknown): unknown
  export function jsxs(type: unknown, props: unknown, key?: unknown): unknown
  export const Fragment: unique symbol
}

declare module 'vitest' {
  type Test = (name: string, body: () => void) => void
  export const describe: Test
  export const it: Test & { skip: Test; only: Test }
  export function expect(value: unknown): { toBe(expected: unknown): void }
}

declare module 'fs' {
  export const sep: string
}
