import { useEffect } from 'react'

declare function lockScroll(): void

export function Overlay({ locked }: { locked: boolean }) {
  useEffect(() => {
    if (locked) {
      lockScroll()
    }
  }, [locked])
  return null
}
