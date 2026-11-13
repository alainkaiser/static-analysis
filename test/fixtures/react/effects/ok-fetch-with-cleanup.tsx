import { useEffect, useState } from 'react'

declare function fetchResults(query: string): Promise<string[]>

export function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState<string[]>([])
  useEffect(() => {
    let ignore = false
    void fetchResults(query).then((json) => {
      if (!ignore) {
        setResults(json)
      }
    })
    return () => {
      ignore = true
    }
  }, [query])
  return <p>{results.length}</p>
}
