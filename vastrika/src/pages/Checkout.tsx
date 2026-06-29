import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Tag, CheckCircle, XCircle, Sparkles } from 'lucide-react'
import type { Address, Order, RazorpayPaymentResponse } from '../types'
import { cartApi } from '../api/cart'
import { ordersApi } from '../api/orders'
import { paymentApi } from '../api/payment'
import { addressesApi } from '../api/addresses'
import { couponsApi, type ActiveOffer, type CouponValidationResult } from '../api/coupons'
import { settingsApi } from '../api/settings'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { INDIA_STATES, COUNTRIES } from '../lib/locationData'

export function Checkout() {
  const navigate = useNavigate()
  const { cart, setCart, clearCart } = useCartStore()
  const { user } = useAuthStore()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'COD'>('Razorpay')
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [showNewAddress, setShowNewAddress] = useState(false)
  const [newAddr, setNewAddr] = useState({ fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' })

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [couponResult, setCouponResult] = useState<CouponValidationResult | null>(null)
  const [validating, setValidating] = useState(false)
  const [activeOffers, setActiveOffers] = useState<ActiveOffer[]>([])
  const [shippingFeeRate, setShippingFeeRate] = useState(99)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1999)

  useEffect(() => {
    Promise.all([cartApi.get(), addressesApi.list(), couponsApi.getActiveOffers(), settingsApi.getShipping()])
      .then(([c, addrs, offers, shippingConfig]) => {
        setShippingFeeRate(shippingConfig.shippingFee)
        setFreeShippingThreshold(shippingConfig.freeShippingThreshold)
        setCart(c)
        setAddresses(addrs)
        setActiveOffers(offers)
        const def = addrs.find((a) => a.isDefault)
        if (def) setSelectedAddressId(def.id)
      })
      .finally(() => setLoading(false))
  }, [setCart])

  async function handleSaveAddress() {
    const result = await addressesApi.create({ ...newAddr, line2: newAddr.line2 || undefined, isDefault: addresses.length === 0 })
    const fullAddr: Address = {
      id: result.id, userId: 0, fullName: newAddr.fullName, phone: newAddr.phone,
      line1: newAddr.line1, line2: newAddr.line2 || undefined,
      city: newAddr.city, state: newAddr.state, pincode: newAddr.pincode,
      country: newAddr.country,
      isDefault: addresses.length === 0,
    }
    setAddresses((prev) => [...prev, fullAddr])
    setSelectedAddressId(result.id)
    setShowNewAddress(false)
    setNewAddr({ fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' })
  }

  async function handleValidateCoupon() {
    if (!couponCode.trim() || !cart) return
    setValidating(true)
    try {
      const result = await couponsApi.validate(couponCode.trim(), cart.total)
      setCouponResult(result)
    } finally {
      setValidating(false)
    }
  }

  function handleRemoveCoupon() {
    setCouponCode('')
    setCouponResult(null)
  }

  function applyOfferCode(code: string) {
    setCouponCode(code)
    setCouponResult(null)
  }

  const discount = couponResult?.isValid ? couponResult.discountAmount : 0
  const shipping = cart && cart.total >= freeShippingThreshold ? 0 : shippingFeeRate
  const finalTotal = cart ? cart.total - discount + shipping : 0

  async function handlePlaceOrder() {
    if (!selectedAddressId) return
    setPlacing(true)
    try {
      const appliedCode = couponResult?.isValid ? couponCode.trim() : undefined
      const order: Order = await ordersApi.place({ addressId: selectedAddressId, paymentMethod, couponCode: appliedCode, shippingFee: shipping })

      if (paymentMethod === 'COD') {
        clearCart()
        navigate(`/orders/${order.id}`)
        return
      }

      const rpOrder = await paymentApi.createOrder(order.id)
      const options = {
        key: rpOrder.keyId,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        name: 'House of Vastrikaa',
        order_id: rpOrder.razorpayOrderId,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#8b1538' },
        handler: async (response: RazorpayPaymentResponse) => {
          await paymentApi.verify({
            orderId: order.id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })
          clearCart()
          navigate(`/orders/${order.id}`)
        },
        modal: { ondismiss: () => setPlacing(false) },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch {
      setPlacing(false)
    }
  }

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>

  if (!cart || cart.items.length === 0) {
    return <div className="py-32 text-center"><p className="text-gray-500">Your cart is empty.</p></div>
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Festival offer banner */}
      {activeOffers.length > 0 && (
        <div className="mb-6 rounded-xl bg-gradient-to-r from-primary-800 to-primary-600 p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span className="text-sm font-semibold text-yellow-300">Festival Offers Active!</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeOffers.map((offer) => (
              <button
                key={offer.id}
                onClick={() => applyOfferCode(offer.festivalName ?? offer.description)}
                className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/25 transition-colors text-left"
              >
                🪔 {offer.festivalName && <strong>{offer.festivalName}: </strong>}
                {offer.discountType === 'Percentage' ? `${offer.discountValue}% off` : `₹${offer.discountValue} off`}
                {offer.minCartAmount ? ` on ₹${offer.minCartAmount}+` : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Delivery address */}
          <div className="rounded-lg border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Delivery Address</h2>
            {addresses.length === 0 && !showNewAddress && (
              <p className="text-sm text-gray-500 mb-3">No saved addresses. Add one to continue.</p>
            )}
            <div className="space-y-3">
              {addresses.map((addr) => (
                <label key={addr.id} className={`flex gap-3 rounded-lg border p-4 cursor-pointer ${selectedAddressId === addr.id ? 'border-primary-800 bg-primary-50' : 'border-gray-100'}`}>
                  <input type="radio" name="address" value={addr.id} checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)} className="mt-0.5 accent-primary-800" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{addr.fullName} · {addr.phone}</p>
                    <p className="text-gray-600">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                    <p className="text-gray-600">{addr.city}, {addr.state} – {addr.pincode}</p>
                    {addr.country && addr.country !== 'India' && <p className="text-gray-500 text-xs">{addr.country}</p>}
                  </div>
                </label>
              ))}
            </div>
            {!showNewAddress ? (
              <button onClick={() => setShowNewAddress(true)} className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary-800 hover:underline">
                <Plus className="h-4 w-4" /> Add new address
              </button>
            ) : (
              <div className="mt-4 space-y-3 border-t pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Full Name" value={newAddr.fullName} onChange={(e) => setNewAddr((p) => ({ ...p, fullName: e.target.value }))} />
                  <Input label="Phone" value={newAddr.phone} onChange={(e) => setNewAddr((p) => ({ ...p, phone: e.target.value }))} />
                </div>
                <Input label="Address Line 1" value={newAddr.line1} onChange={(e) => setNewAddr((p) => ({ ...p, line1: e.target.value }))} />
                <Input label="Address Line 2 (optional)" value={newAddr.line2} onChange={(e) => setNewAddr((p) => ({ ...p, line2: e.target.value }))} />
                {/* Country → State → City + Pincode */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Country</label>
                  <select value={newAddr.country} onChange={(e) => setNewAddr((p) => ({ ...p, country: e.target.value, state: '' }))}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800">
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {newAddr.country === 'India' ? (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">State / UT</label>
                    <select value={newAddr.state} onChange={(e) => setNewAddr((p) => ({ ...p, state: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800">
                      <option value="">Select state</option>
                      {INDIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                ) : (
                  <Input label="State / Province" value={newAddr.state} onChange={(e) => setNewAddr((p) => ({ ...p, state: e.target.value }))} />
                )}
                <div className="grid grid-cols-2 gap-3">
                  <Input label="City" value={newAddr.city} onChange={(e) => setNewAddr((p) => ({ ...p, city: e.target.value }))} />
                  <Input label={newAddr.country === 'India' ? 'Pincode' : 'ZIP / Postal Code'} value={newAddr.pincode}
                    onChange={(e) => setNewAddr((p) => ({ ...p, pincode: e.target.value }))}
                    placeholder={newAddr.country === 'India' ? '6-digit pincode' : 'Postal code'} />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveAddress}>Save Address</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowNewAddress(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>

          {/* Payment method */}
          <div className="rounded-lg border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Payment Method</h2>
            <div className="space-y-2">
              {(['Razorpay', 'COD'] as const).map((method) => (
                <label key={method} className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer ${paymentMethod === method ? 'border-primary-800 bg-primary-50' : 'border-gray-100'}`}>
                  <input type="radio" name="payment" value={method} checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)} className="accent-primary-800" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{method === 'Razorpay' ? 'Online Payment (Razorpay)' : 'Cash on Delivery'}</p>
                    <p className="text-xs text-gray-500">{method === 'Razorpay' ? 'UPI, Cards, Netbanking & more' : 'Pay when your order arrives'}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Coupon code */}
          <div className="rounded-lg border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary-800" /> Coupon Code
            </h2>

            {couponResult?.isValid ? (
              <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-4 py-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <div>
                    <span className="font-mono font-semibold text-green-800">{couponCode.toUpperCase()}</span>
                    <span className="text-green-700 ml-2">— ₹{couponResult.discountAmount.toLocaleString('en-IN')} off</span>
                    {couponResult.description && <p className="text-xs text-green-600 mt-0.5">{couponResult.description}</p>}
                  </div>
                </div>
                <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-red-500">
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null) }}
                    onKeyDown={(e) => e.key === 'Enter' && handleValidateCoupon()}
                    className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm font-mono uppercase focus:border-primary-800 focus:outline-none"
                  />
                  <Button size="sm" onClick={handleValidateCoupon} loading={validating} disabled={!couponCode.trim()}>
                    Apply
                  </Button>
                </div>
                {couponResult && !couponResult.isValid && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" /> {couponResult.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Order summary */}
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-6 h-fit">
          <h2 className="font-serif text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          <ul className="space-y-2 text-sm">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span className="text-gray-600 line-clamp-1 flex-1 mr-2">{item.productName} × {item.quantity}</span>
                <span>₹{item.subtotal.toLocaleString('en-IN')}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1.5 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>₹{cart.total.toLocaleString('en-IN')}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Coupon Discount</span>
                <span>−₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
            </div>
          </div>
          <div className="mt-3 border-t pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{finalTotal.toLocaleString('en-IN')}</span>
          </div>
          <Button className="w-full mt-5" size="lg" loading={placing}
            disabled={!selectedAddressId} onClick={handlePlaceOrder}>
            {paymentMethod === 'Razorpay' ? 'Pay Now' : 'Place Order'}
          </Button>
        </div>
      </div>
    </div>
  )
}
