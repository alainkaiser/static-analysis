import { useEffect, useRef, useState } from 'react'

export function Sentinel({ onVisible }: { onVisible: () => void }) {
  const ref = useRef<Element | null>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const target = ref.current
    const intersection = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        onVisible()
      }
    })
    const resize = new ResizeObserver(([entry]) => {
      setWidth(entry?.contentRect.width ?? 0)
    })
    if (target !== null) {
      intersection.observe(target)
      resize.observe(target)
    }
    return () => {
      intersection.disconnect()
      resize.disconnect()
    }
  }, [onVisible])
  return <div ref={ref}>{width}</div>
}
