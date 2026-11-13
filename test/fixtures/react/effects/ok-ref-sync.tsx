import { useEffect, useRef } from 'react'

export function Modal({ open }: { open: boolean }) {
  const ref = useRef<{ showModal(): void; close(): void } | null>(null)
  useEffect(() => {
    if (open) {
      ref.current?.showModal()
    } else {
      ref.current?.close()
    }
  }, [open])
  return <dialog ref={ref} />
}

export function Editor({ value }: { value: string }) {
  const ref = useRef<{ setValue(next: string): void } | null>(null)
  useEffect(() => {
    if (value !== '') {
      ref.current?.setValue(value)
    }
  }, [value])
  return <div ref={ref} />
}
