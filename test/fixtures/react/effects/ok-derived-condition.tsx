import { useEffect } from 'react'

declare function validateCode(code: string): string | null
declare function saveCode(code: string): void

export function useSaveReferralCode(code: string): void {
  useEffect(() => {
    const valid = validateCode(code)
    if (valid !== null) {
      saveCode(valid)
    }
  }, [code])
}
