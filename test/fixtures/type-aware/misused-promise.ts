async function save(): Promise<void> {}

export function saveAll(ids: number[]): void {
  ids.forEach(async () => {
    await save()
  })
}
