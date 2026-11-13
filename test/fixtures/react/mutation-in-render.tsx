export function Resize(props: { config: { size: number } }) {
  props.config.size = 2
  return <p>{props.config.size}</p>
}
