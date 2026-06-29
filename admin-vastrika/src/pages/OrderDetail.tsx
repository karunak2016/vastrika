import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Truck } from 'lucide-react'
import type { Order } from '../types'
import { ordersApi } from '../api/orders'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'

const NEXT_STATUS: Record<string, string> = {
  Pending:   'Confirmed',
  Confirmed: 'Shipped',
  Shipped:   'Delivered',
}

function orderBadge(s: string): 'warning' | 'info' | 'purple' | 'success' | 'danger' | 'default' {
  const m: Record<string, 'warning' | 'info' | 'purple' | 'success' | 'danger'> = {
    Pending: 'warning', Confirmed: 'info', Shipped: 'purple', Delivered: 'success', Cancelled: 'danger',
  }
  return m[s] ?? 'default'
}

export function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [awbInput, setAwbInput] = useState('')

  useEffect(() => {
    if (!id) return
    ordersApi.getById(Number(id)).then(setOrder).finally(() => setLoading(false))
  }, [id])

  async function handleStatusUpdate(status: string, awbCode?: string) {
    if (!order) return
    setUpdatingStatus(true)
    try {
      await ordersApi.updateStatus(order.id, status, awbCode || undefined)
      setOrder((prev) => prev ? { ...prev, orderStatus: status, awbCode: awbCode || prev.awbCode } : null)
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>

  if (!order) {
    return (
      <div className="py-32 text-center">
        <p className="text-gray-500">Order not found.</p>
        <Link to="/orders" className="mt-3 inline-block text-primary-800 hover:underline">Back to orders</Link>
      </div>
    )
  }

  const nextStatus = NEXT_STATUS[order.orderStatus]

  return (
    <div className="max-w-3xl space-y-6">
      <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-800">
        <ChevronLeft className="h-4 w-4" /> All Orders
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Order #{order.id}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={orderBadge(order.orderStatus)}>{order.orderStatus}</Badge>
          <Badge variant={order.paymentStatus === 'Paid' ? 'success' : 'warning'}>{order.paymentStatus}</Badge>
        </div>
      </div>

      {/* Status update */}
      {order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Update Order Status</h2>

          {/* AWB input shown when about to ship */}
          {order.orderStatus === 'Confirmed' && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                <Truck className="h-3 w-3" /> Tracking / AWB Number (optional)
              </label>
              {order.awbCode ? (
                <p className="text-sm font-mono text-green-700 font-medium">{order.awbCode}</p>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. 123456789012"
                  value={awbInput}
                  onChange={(e) => setAwbInput(e.target.value)}
                  className="w-full max-w-xs rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:border-primary-800 focus:outline-none"
                />
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {nextStatus && (
              <Button
                size="sm"
                loading={updatingStatus}
                onClick={() => handleStatusUpdate(nextStatus, nextStatus === 'Shipped' ? awbInput : undefined)}
              >
                Mark as {nextStatus}
              </Button>
            )}
            <Button size="sm" variant="danger" loading={updatingStatus} onClick={() => handleStatusUpdate('Cancelled')}>
              Cancel Order
            </Button>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Items ({order.items?.length ?? 0})</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {order.items?.map((item) => (
            <div key={item.productId} className="flex items-center gap-4 px-5 py-4">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.productName} className="h-14 w-10 rounded object-cover object-top flex-shrink-0" />
              ) : (
                <div className="h-14 w-10 rounded bg-gray-100 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')}</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">₹{item.subtotal.toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-gray-100 space-y-1 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span><span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span><span>-₹{order.discountAmount.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-100">
            <span>Total</span>
            <span className="text-primary-800">₹{order.finalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment</h2>
        <p className="text-sm text-gray-700">Method: <span className="font-medium">{order.paymentMethod}</span></p>
        <p className="text-sm text-gray-700">Status: <span className="font-medium">{order.paymentStatus}</span></p>
      </div>
    </div>
  )
}
