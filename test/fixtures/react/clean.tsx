import { useState } from 'react'

export function Clean({ items }: { items: { id: string; label: string }[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)}>
        Toggle
      </button>
      {open && (
        <ul>
          {items.map((item) => (
            <li key={item.id}>{item.label}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
