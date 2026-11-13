import { useEffect } from 'react'

export function Widget({
  id,
  onReady,
}: {
  id: string
  onReady: (id: string) => void
}) {
  useEffect(() => {
    onReady(id)
  }, [id, onReady])
  return null
}
