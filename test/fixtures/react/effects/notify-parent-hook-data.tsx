import { useEffect } from 'react'

declare function useProfile(): { name: string } | null

export function Profile({
  onLoaded,
}: {
  onLoaded: (profile: { name: string }) => void
}) {
  const profile = useProfile()
  useEffect(() => {
    if (profile) {
      onLoaded(profile)
    }
  }, [onLoaded, profile])
  return null
}
