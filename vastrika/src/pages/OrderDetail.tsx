import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import type { Order } from '../types'
import { ordersApi } from '../api/orders'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'

function statusVariant(status: string): 'default' | 'info' | 'success' | 'warning' | 'danger' {
  const map: Record<string, 'default' | 'info' | 'success' | 'warning' | 'danger'> = {
    Pending: 'warning', Confirmed: 'info', Shipped: 'info', Delivered: 'success', Cancelled: 'danger',
  }
  return map[status] ?? 'default'
}

export function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!id) return
    ordersApi.getById(Number(id)).then(setOrder).finally(() => setLoading(false))
  }, [id])

  async function handleCancel() {
    if (!order) return
    setCancelling(true)
    try {
      await ordersApi.cancel(order.id)
      setOrder((prev) => prev ? { ...prev, orderStatus: 'Cancelled' } : null)
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>

  if (!order) {
    return (
      <div className="py-32 text-center">
        <p className="text-gray-500">Order not found.</p>
        <Link to="/orders" className="mt-4 inline-block text-primary-800 hover:underline">Back to orders</Link>
      </div>
    )
  }

  const canCancel = order.orderStatus === 'Pending' || order.orderStatus === 'Confirmed'

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/orders" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-800">
        <ChevronLeft className="h-4 w-4" /> My Orders
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Order #{order.id}</h1>
          <p className="mt-1 text-sm text-gray-400">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={statusVariant(order.orderStatus)}>{order.orderStatus}</Badge>
          <Badge variant={order.paymentStatus === 'Paid' ? 'success' : 'warning'}>{order.paymentStatus}</Badge>
        </div>
      </div>

      <div className="space-y-6">
        {/* Items */}
        <div className="rounded-lg border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Items</h2>
          <div className="divide-y divide-gray-100">
            {order.items?.map((item) => (
              <div key={item.productId} className="flex gap-4 py-4">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.productName} className="h-20 w-16 rounded object-cover object-top" />
                ) : (
                  <div className="h-20 w-16 rounded bg-gray-100" />
                )}
                <div className="flex flex-1 justify-between">
                  <div>
                    <Link to={`/products/${item.productId}`} className="text-sm font-medium text-gray-900 hover:text-primary-800">
                      {item.productName}
                    </Link>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-sm text-gray-500">₹{item.unitPrice.toLocaleString('en-IN')} each</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">₹{item.subtotal.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t pt-4 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span><span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span><span>-₹{order.discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t">
              <span>Total</span>
              <span className="text-primary-800">₹{order.finalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Shipping tracking */}
        {order.awbCode && (
          <div className="rounded-lg border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-2">Tracking</h2>
            <p className="text-sm text-gray-600">AWB: <span className="font-medium">{order.awbCode}</span></p>
          </div>
        )}

        {/* Payment */}
        <div className="rounded-lg border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-2">Payment</h2>
          <p className="text-sm text-gray-600">Method: {order.paymentMethod}</p>
          <p className="text-sm text-gray-600">Status: {order.paymentStatus}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {canCancel && (
            <Button variant="danger" loading={cancelling} onClick={handleCancel}>
              Cancel Order
            </Button>
          )}
          <Link to="/products">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
