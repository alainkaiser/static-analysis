export function message(result: Promise<string>): Promise<string> {
  return result.catch((reason: Error) => reason.message)
}
