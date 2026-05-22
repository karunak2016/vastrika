import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCartStore } from '../../stores/cartStore'
import { useAuthStore } from '../../stores/authStore'
import { cartApi } from '../../api/cart'
import { Button } from '../ui/Button'

export function CartDrawer() {
  const { cart, isOpen, itemCount, closeDrawer, setCart, clearCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  // Load cart when drawer opens and user is authenticated
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      cartApi.get().then(setCart).catch(() => {})
    }
    if (isOpen && !isAuthenticated) {
      clearCart()
    }
  }, [isOpen, isAuthenticated, setCart, clearCart])

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeDrawer()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeDrawer])

  async function handleUpdateQty(itemId: number, qty: number) {
    if (qty < 1) return
    const updated = await cartApi.updateItem(itemId, qty)
    setCart(updated)
  }

  async function handleRemove(itemId: number) {
    const updated = await cartApi.removeItem(itemId)
    setCart(updated)
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={closeDrawer}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-serif text-lg font-semibold text-gray-900">
            Shopping Bag {itemCount > 0 ? `(${itemCount})` : ''}
          </h2>
          <button onClick={closeDrawer} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <ShoppingBag className="h-12 w-12 text-gray-200" />
              <p className="text-gray-500">Login to view your cart</p>
              <Link to="/login" onClick={closeDrawer}>
                <Button>Login</Button>
              </Link>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <ShoppingBag className="h-12 w-12 text-gray-200" />
              <p className="text-gray-500">Your bag is empty</p>
              <Link to="/products" onClick={closeDrawer}>
                <Button variant="outline">Browse Sarees</Button>
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {cart.items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="h-20 w-16 rounded object-cover object-top"
                    />
                  ) : (
                    <div className="h-20 w-16 rounded bg-gray-100" />
                  )}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.productName}</p>
                      <p className="mt-0.5 text-sm font-semibold text-primary-800">
                        ₹{item.unitPrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      {/* Qty controls */}
                      <div className="flex items-center gap-1 rounded border border-gray-200">
                        <button
                          onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1 text-gray-500 hover:text-primary-800 disabled:opacity-30"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                          className="p-1 text-gray-500 hover:text-primary-800"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="border-t px-5 py-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold text-gray-900">₹{cart.total.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-xs text-gray-400">Shipping & taxes calculated at checkout</p>
            <Link to="/checkout" onClick={closeDrawer} className="block">
              <Button className="w-full" size="lg">Proceed to Checkout</Button>
            </Link>
            <Link to="/cart" onClick={closeDrawer} className="block text-center text-sm text-primary-800 hover:underline">
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
