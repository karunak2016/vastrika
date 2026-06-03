import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { cartApi } from '../api/cart'
import { couponsApi, type BankOffer } from '../api/coupons'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'

export function Cart() {
  const { cart, setCart, itemCount } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [bankOffers, setBankOffers] = useState<BankOffer[]>([])

  useEffect(() => {
    couponsApi.getBankOffers().then(setBankOffers).catch(() => {})
    if (!isAuthenticated) { setLoading(false); return }
    cartApi.get().then(setCart).finally(() => setLoading(false))
  }, [isAuthenticated, setCart])

  async function handleUpdateQty(itemId: number, qty: number) {
    if (qty < 1) return
    const updated = await cartApi.updateItem(itemId, qty)
    setCart(updated)
  }

  async function handleRemove(itemId: number) {
    const updated = await cartApi.removeItem(itemId)
    setCart(updated)
  }

  if (loading) {
    return <div className="flex justify-center py-32"><Spinner size="lg" /></div>
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center gap-4 py-32 text-center">
        <ShoppingBag className="h-16 w-16 text-gray-200" />
        <p className="text-gray-500">Please login to view your cart</p>
        <Link to="/login"><Button>Login</Button></Link>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-32 text-center">
        <ShoppingBag className="h-16 w-16 text-gray-200" />
        <p className="text-xl font-medium text-gray-700">Your bag is empty</p>
        <Link to="/products"><Button variant="outline">Browse Sarees</Button></Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-2xl font-bold text-gray-900 mb-8">Shopping Bag</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2 divide-y divide-gray-100">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-4 py-5">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.productName} className="h-28 w-20 rounded object-cover object-top" />
              ) : (
                <div className="h-28 w-20 rounded bg-gray-100" />
              )}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link to={`/products/${item.productId}`} className="text-sm font-medium text-gray-900 hover:text-primary-800">
                    {item.productName}
                  </Link>
                  <p className="mt-1 text-sm font-semibold text-primary-800">₹{item.unitPrice.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 rounded border border-gray-200">
                    <button onClick={() => handleUpdateQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="p-1.5 text-gray-500 hover:text-primary-800 disabled:opacity-30">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => handleUpdateQty(item.id, item.quantity + 1)} className="p-1.5 text-gray-500 hover:text-primary-800">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold">₹{item.subtotal.toLocaleString('en-IN')}</span>
                    <button onClick={() => handleRemove(item.id)} className="text-gray-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-6 h-fit">
          <h2 className="font-serif text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal ({itemCount} items)</span><span>₹{cart.total.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span className="text-green-600">{cart.total >= 1999 ? 'FREE' : '₹99'}</span></div>
          </div>
          <div className="mt-4 border-t border-gray-200 pt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{(cart.total + (cart.total >= 1999 ? 0 : 99)).toLocaleString('en-IN')}</span>
          </div>
          {bankOffers.length > 0 && (
            <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3 space-y-2">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Bank Card Offers</p>
              {bankOffers.map((offer) => (
                <p key={offer.id} className="text-xs text-blue-800">
                  <span className="font-semibold">{offer.bankName}:</span>{' '}
                  {offer.description}
                  {offer.code && (
                    <> — <span className="font-mono font-bold bg-blue-100 px-1 rounded">{offer.code}</span></>
                  )}
                </p>
              ))}
            </div>
          )}
          <Link to="/checkout" className="block mt-5">
            <Button className="w-full" size="lg">Proceed to Checkout</Button>
          </Link>
          <Link to="/products" className="block mt-3 text-center text-sm text-gray-500 hover:text-primary-800">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
