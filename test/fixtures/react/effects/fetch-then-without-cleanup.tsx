import { useEffect, useState } from 'react'

declare function fetchResults(query: string): Promise<string[]>

export function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState<string[]>([])
  useEffect(() => {
    void fetchResults(query).then((json) => {
      setResults(json)
    })
  }, [query])
  return <p>{results.length}</p>
}
