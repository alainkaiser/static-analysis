export function Checks({ items, html }: { items: string[]; html: string }) {
  return (
    <>
      <button onClick={() => {}}>Go</button>
      <img src="/a.png" />
      {items.map((item, index) => (
        <span key={index}>{item}</span>
      ))}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  )
}
