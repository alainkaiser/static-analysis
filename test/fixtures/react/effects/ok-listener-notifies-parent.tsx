import { useEffect, useState } from 'react'

export function Search({ onSubmit }: { onSubmit: (query: string) => void }) {
  const [query, setQuery] = useState('')
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Enter') {
        onSubmit(query)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onSubmit, query])
  return (
    <input
      value={query}
      onChange={(e: { target: { value: string } }) => setQuery(e.target.value)}
    />
  )
}
