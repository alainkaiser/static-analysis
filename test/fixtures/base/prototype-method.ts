export function contains(
  fields: Record<string, unknown>,
  key: string,
): boolean {
  return fields.hasOwnProperty(key)
}
