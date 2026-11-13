export function Parent({ label }: { label: string }) {
  function Child() {
    return <p>{label}</p>
  }
  return <Child />
}
