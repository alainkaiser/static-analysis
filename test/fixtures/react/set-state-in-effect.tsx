import { useEffect, useState } from 'react'

export function Doubled({ value }: { value: number }) {
  const [doubled, setDoubled] = useState(0)
  useEffect(() => {
    setDoubled(value * 2)
  }, [value])
  return <p>{doubled}</p>
}
