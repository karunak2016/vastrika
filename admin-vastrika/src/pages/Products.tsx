import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2, ImageOff } from 'lucide-react'
import type { Product } from '../types'
import { productsApi } from '../api/products'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { Badge } from '../components/ui/Badge'

export function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deactivating, setDeactivating] = useState<number | null>(null)

  useEffect(() => {
    productsApi.list().then((data) => {
      setProducts(data)
      setFiltered(data)
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      q ? products.filter((p) => p.name.toLowerCase().includes(q) || p.categoryName?.toLowerCase().includes(q)) : products,
    )
  }, [search, products])

  async function handleDeactivate(id: number) {
    if (!confirm('Deactivate this product? It will be hidden from the store.')) return
    setDeactivating(id)
    try {
      await productsApi.deactivate(id)
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, isActive: false } : p))
    } finally {
      setDeactivating(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-primary-800 focus:outline-none"
          />
        </div>
        <Link to="/products/new">
          <Button size="sm">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-400">No products found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fabric</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.defaultImageUrl ? (
                          <img src={p.defaultImageUrl} alt={p.name} className="h-10 w-8 rounded object-cover object-top flex-shrink-0" />
                        ) : (
                          <div className="h-10 w-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <ImageOff className="h-4 w-4 text-gray-300" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900 max-w-[200px] truncate">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.categoryName}</td>
                    <td className="px-4 py-3 text-gray-600">{p.fabric}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{p.stockQuantity}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={p.isActive ? 'success' : 'danger'}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/products/${p.id}/edit`}>
                          <button className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary-800">
                            <Pencil className="h-4 w-4" />
                          </button>
                        </Link>
                        {p.isActive && (
                          <button
                            onClick={() => handleDeactivate(p.id)}
                            disabled={deactivating === p.id}
                            className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
