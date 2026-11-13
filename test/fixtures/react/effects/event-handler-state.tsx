import { useEffect, useState } from 'react'

declare function post(url: string, body: { name: string }): Promise<void>

export function Form() {
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState<{ name: string } | null>(null)
  useEffect(() => {
    if (submitted !== null) {
      void post('/api/register', submitted)
    }
  }, [submitted])
  return (
    <form
      onSubmit={(event: { preventDefault(): void }) => {
        event.preventDefault()
        setSubmitted({ name })
      }}
    >
      <input
        value={name}
        onChange={(e: { target: { value: string } }) => setName(e.target.value)}
      />
    </form>
  )
}
