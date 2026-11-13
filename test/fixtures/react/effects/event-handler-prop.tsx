import { useEffect } from 'react'

declare function showNotification(message: string): void

export function ProductPage({
  product,
}: {
  product: { name: string; isInCart: boolean }
}) {
  useEffect(() => {
    if (product.isInCart) {
      showNotification(`Added ${product.name} to the cart`)
    }
  }, [product])
  return <h1>{product.name}</h1>
}
