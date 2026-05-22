import { Link } from 'react-router-dom'
import { Heart, ShoppingBag } from 'lucide-react'
import type { ProductListItem } from '../../types'
import { useCartStore } from '../../stores/cartStore'
import { useWishlistStore } from '../../stores/wishlistStore'
import { useAuthStore } from '../../stores/authStore'
import { cartApi } from '../../api/cart'
import { wishlistApi } from '../../api/wishlist'

interface ProductCardProps {
  product: ProductListItem
}

export function ProductCard({ product }: ProductCardProps) {
  const { setCart } = useCartStore()
  const { isWishlisted, addItem, removeItem } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()

  const wishlisted = isWishlisted(product.id)

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (!isAuthenticated) return
    const cart = await cartApi.addItem({ productId: product.id, quantity: 1 })
    setCart(cart)
  }

  async function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    if (!isAuthenticated) return
    if (wishlisted) {
      await wishlistApi.remove(product.id)
      removeItem(product.id)
    } else {
      await wishlistApi.add(product.id)
      addItem({ productId: product.id, productName: product.name, imageUrl: product.defaultImageUrl, price: product.price })
    }
  }

  const displayPrice = product.discountedPrice ?? product.price

  return (
    <Link
      to={`/products/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-cream-100">
        {product.defaultImageUrl ? (
          <img src={product.defaultImageUrl} alt={product.name} className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <ShoppingBag className="h-12 w-12" />
          </div>
        )}

        {isAuthenticated && (
          <button onClick={handleToggleWishlist} className="absolute right-2 top-2 rounded-full bg-white p-1.5 shadow transition-colors hover:bg-primary-50">
            <Heart className={`h-4 w-4 ${wishlisted ? 'fill-primary-800 text-primary-800' : 'text-gray-400'}`} />
          </button>
        )}

        {product.discountedPrice && (
          <span className="absolute left-2 top-2 rounded bg-primary-800 px-1.5 py-0.5 text-[10px] font-medium text-white">
            {Math.round((1 - product.discountedPrice / product.price) * 100)}% OFF
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">{product.categoryName}</p>
          <h3 className="mt-0.5 text-sm font-medium text-gray-900 line-clamp-2">{product.name}</h3>
          <p className="mt-0.5 text-xs text-gray-500">{product.fabric} · {product.color}</p>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="font-semibold text-primary-800">₹{displayPrice.toLocaleString('en-IN')}</span>
            {product.discountedPrice && (
              <span className="ml-1.5 text-xs text-gray-400 line-through">₹{product.price.toLocaleString('en-IN')}</span>
            )}
          </div>
          {isAuthenticated && (
            <button onClick={handleAddToCart} className="flex items-center gap-1 rounded border border-primary-800 px-2 py-1 text-xs font-medium text-primary-800 hover:bg-primary-800 hover:text-white transition-colors">
              <ShoppingBag className="h-3 w-3" /> Add
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}
