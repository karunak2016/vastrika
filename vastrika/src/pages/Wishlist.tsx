import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { wishlistApi } from '../api/wishlist'
import { cartApi } from '../api/cart'
import { useWishlistStore } from '../stores/wishlistStore'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'

export function Wishlist() {
  const { items, setItems, removeItem } = useWishlistStore()
  const { setCart, openDrawer } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return }
    wishlistApi.get().then(setItems).finally(() => setLoading(false))
  }, [isAuthenticated, setItems])

  async function handleRemove(productId: number) {
    await wishlistApi.remove(productId)
    removeItem(productId)
  }

  async function handleMoveToCart(productId: number) {
    const cart = await cartApi.addItem({ productId, quantity: 1 })
    setCart(cart)
    openDrawer()
    await wishlistApi.remove(productId)
    removeItem(productId)
  }

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center gap-4 py-32 text-center">
        <Heart className="h-16 w-16 text-gray-200" />
        <p className="text-gray-500">Login to view your wishlist</p>
        <Link to="/login"><Button>Login</Button></Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-2xl font-bold text-gray-900 mb-8">
        My Wishlist {items.length > 0 && <span className="text-gray-400 text-lg">({items.length})</span>}
      </h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <Heart className="h-16 w-16 text-gray-200" />
          <p className="text-xl font-medium text-gray-700">Your wishlist is empty</p>
          <Link to="/products"><Button variant="outline">Discover Sarees</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items.map((item) => (
            <div key={item.productId} className="flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
              <Link to={`/products/${item.productId}`} className="block">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.productName} className="h-56 w-full object-cover object-top" />
                ) : (
                  <div className="flex h-56 items-center justify-center bg-gray-100">
                    <ShoppingBag className="h-10 w-10 text-gray-300" />
                  </div>
                )}
              </Link>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <Link to={`/products/${item.productId}`} className="text-sm font-medium text-gray-900 hover:text-primary-800 line-clamp-2">
                  {item.productName}
                </Link>
                <p className="font-semibold text-primary-800">₹{item.price.toLocaleString('en-IN')}</p>
                <div className="mt-auto flex gap-2">
                  <button
                    onClick={() => handleMoveToCart(item.productId)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded bg-primary-800 px-3 py-2 text-xs font-medium text-white hover:bg-primary-900"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" /> Move to Bag
                  </button>
                  <button onClick={() => handleRemove(item.productId)} className="rounded border border-gray-200 p-2 text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
