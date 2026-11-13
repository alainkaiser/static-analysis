export function fail(reason: string): never {
  throw 'failed: ' + reason
}
