declare function load(): Promise<string[]>

export function count(): Promise<number> {
  return load()
    .then((items) => {
      items.sort()
    })
    .then(() => 0)
}
