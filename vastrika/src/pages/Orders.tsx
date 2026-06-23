import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import type { Order } from '../types'
import { ordersApi } from '../api/orders'
import { useAuthStore } from '../stores/authStore'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'

function statusVariant(status: string): 'default' | 'info' | 'success' | 'warning' | 'danger' {
  const map: Record<string, 'default' | 'info' | 'success' | 'warning' | 'danger'> = {
    Pending:   'warning',
    Confirmed: 'info',
    Shipped:   'info',
    Delivered: 'success',
    Cancelled: 'danger',
  }
  return map[status] ?? 'default'
}

export function Orders() {
  const { isAuthenticated } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return }
    ordersApi.list().then(setOrders).finally(() => setLoading(false))
  }, [isAuthenticated])

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center gap-4 py-32 text-center">
        <Package className="h-16 w-16 text-gray-200" />
        <p className="text-gray-500">Login to view your orders</p>
        <Link to="/login"><Button>Login</Button></Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-2xl font-bold text-gray-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <Package className="h-16 w-16 text-gray-200" />
          <p className="text-xl font-medium text-gray-700">No orders yet</p>
          <Link to="/products"><Button variant="outline">Start Shopping</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block rounded-lg border border-gray-100 bg-white p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Order #{order.id}</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={statusVariant(order.orderStatus)}>{order.orderStatus}</Badge>
                  <Badge variant={order.paymentStatus === 'Paid' ? 'success' : 'warning'}>{order.paymentStatus}</Badge>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-gray-500">{order.itemCount ?? order.items?.length ?? 0} item{(order.itemCount ?? order.items?.length ?? 0) !== 1 ? 's' : ''}</p>
                <p className="font-semibold text-primary-800">₹{order.finalAmount.toLocaleString('en-IN')}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
