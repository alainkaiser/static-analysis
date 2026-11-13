import { useEffect, useState } from 'react'

declare function fetchUser(id: string): Promise<{ name: string }>

export function User({ id }: { id: string }) {
  const [name, setName] = useState('')
  useEffect(() => {
    async function load() {
      const user = await fetchUser(id)
      setName(user.name)
    }
    void load()
  }, [id])
  return <p>{name}</p>
}
