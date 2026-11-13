import { useEffect } from 'react'

declare function createConnection(roomId: string): {
  connect(): void
  disconnect(): void
}

export function ChatRoom({ roomId }: { roomId: string }) {
  useEffect(() => {
    const connection = createConnection(roomId)
    connection.connect()
    return () => connection.disconnect()
  }, [roomId])
  return <h1>{roomId}</h1>
}
