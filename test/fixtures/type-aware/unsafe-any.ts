export function parse(text: string): { id: string } {
  const data = JSON.parse(text)
  return data
}
