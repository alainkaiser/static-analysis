import { useEffect, useRef } from 'react'

export function Sentinel({ onVisible }: { onVisible: () => void }) {
  const ref = useRef<Element | null>(null)
  useEffect(() => {
    const target = ref.current
    if (target === null) {
      return
    }
    const observer = new IntersectionObserver(() => onVisible())
    observer.observe(target)
    return () => observer.disconnect()
  }, [onVisible])
  return <div ref={ref} />
}
