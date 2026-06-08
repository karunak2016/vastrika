import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import type { ProductListItem } from '../types'
import { productsApi } from '../api/products'
import { categoriesApi } from '../api/categories'
import { ProductCard } from '../components/product/ProductCard'
import { ProductFilters } from '../components/product/ProductFilters'
import { Spinner } from '../components/ui/Spinner'

export function Products() {
  const { categorySlug, fabric: fabricParam, sortBy: sortByParam } = useParams<{ categorySlug?: string; fabric?: string; sortBy?: string }>()
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const q = searchParams.get('q')

  useEffect(() => {
    setLoading(true)

    async function load() {
      let categoryId: number | undefined
      if (categorySlug) {
        const cats = await categoriesApi.list().catch(() => [])
        categoryId = cats.find((c) => c.name.replace(/\s+/g, '-') === categorySlug.replace(/\s+/g, '-'))?.id
      }

      const filters = {
        categoryId,
        fabric: fabricParam ?? undefined,
        minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
        maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
        sortBy: (sortByParam as 'price_asc' | 'price_desc' | 'newest' | 'name') ?? undefined,
        state: searchParams.get('state') ?? undefined,
      }

      const result = await (q ? productsApi.search(q) : productsApi.list(filters))
      return result.items
    }

    load()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [categorySlug, fabricParam, sortByParam, searchParams, q])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            {q ? `Search: "${q}"` : 'All Sarees'}
          </h1>
          {!loading && (
            <p className="mt-1 text-sm text-gray-500">{products.length} product{products.length !== 1 ? 's' : ''}</p>
          )}
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-2 rounded border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:border-primary-800 hover:text-primary-800 lg:hidden"
        >
          {showFilters ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
          Filters
        </button>
      </div>

      <div className="mt-6 flex gap-8">
        <div className={`${showFilters ? 'block' : 'hidden'} w-48 flex-shrink-0 lg:block`}>
          <ProductFilters />
        </div>

        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-24"><Spinner size="lg" /></div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center text-gray-400">
              <p className="text-lg">No products found</p>
              <p className="mt-1 text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
