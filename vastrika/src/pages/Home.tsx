import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { ProductListItem, Category } from '../types'
import { productsApi } from '../api/products'
import { categoriesApi } from '../api/categories'
import { ProductCard } from '../components/product/ProductCard'
import { Spinner } from '../components/ui/Spinner'

export function Home() {
  const [featured, setFeatured] = useState<ProductListItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      productsApi.list({ sortBy: 'newest', pageSize: 8 }),
      categoriesApi.list(),
    ])
      .then(([products, cats]) => {
        setFeatured(products.items)
        setCategories(cats)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_80%_50%,_#d4af37_0%,_transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-gold-400 text-sm font-medium uppercase tracking-widest">New Collection 2026</p>
            <h1 className="mt-3 font-serif text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Drape Yourself<br />in Elegance
            </h1>
            <p className="mt-5 text-lg text-primary-200 leading-relaxed">
              Handcrafted sarees from India's finest weavers. Every thread tells a story of heritage, artistry, and timeless beauty.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded bg-gold-500 px-6 py-3 font-medium text-white hover:bg-gold-600 transition-colors"
              >
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/products/sortBy/newest"
                className="inline-flex items-center gap-2 rounded border border-white/40 px-6 py-3 font-medium text-white hover:bg-white/10 transition-colors"
              >
                New Arrivals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl font-bold text-gray-900">Shop by Category</h2>
          <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
            {categories.filter((c) => c.isActive).map((cat) => (
              <Link
                key={cat.id}
                to={`/products/category/${cat.id}`}
                className="flex-shrink-0 rounded-full border border-primary-200 bg-cream-50 px-5 py-2 text-sm font-medium text-primary-800 hover:bg-primary-800 hover:text-white transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-gray-900">New Arrivals</h2>
          <Link to="/products" className="text-sm font-medium text-primary-800 hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Value propositions */}
      <section className="border-t border-gray-100 bg-cream-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { title: 'Authentic Handloom', desc: 'Directly sourced from weavers across India' },
              { title: 'Free Shipping', desc: 'On all orders above ₹1,999' },
              { title: 'Easy Returns', desc: '7-day hassle-free return policy' },
            ].map((v) => (
              <div key={v.title} className="text-center">
                <h3 className="font-serif text-base font-semibold text-gray-900">{v.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
