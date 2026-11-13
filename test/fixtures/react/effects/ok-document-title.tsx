import { useEffect } from 'react'

export function Title({ title, enabled }: { title: string; enabled: boolean }) {
  useEffect(() => {
    if (enabled) {
      document.title = title
    }
  }, [enabled, title])
  return null
}
