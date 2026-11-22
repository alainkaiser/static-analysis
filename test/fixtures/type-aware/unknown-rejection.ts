export function message(result: Promise<string>): Promise<string> {
  return result.catch((reason: unknown) =>
    reason instanceof Error ? reason.message : 'unavailable',
  )
}
