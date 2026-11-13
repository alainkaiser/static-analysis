async function save(): Promise<void> {}

export async function trySave(): Promise<boolean> {
  try {
    return save().then(() => true)
  } catch {
    return false
  }
}
