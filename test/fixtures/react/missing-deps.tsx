import { useEffect, useMemo } from 'react'

export function Title({ title }: { title: string }) {
  useEffect(() => {
    document.title = title
  }, [])
  const upper = useMemo(() => title.toUpperCase(), [])
  return <h1>{upper}</h1>
}
