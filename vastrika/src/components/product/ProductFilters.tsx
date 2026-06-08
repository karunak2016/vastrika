import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { Category } from '../../types'
import { categoriesApi } from '../../api/categories'
import { settingsApi } from '../../api/settings'

const FABRICS = ['Silk', 'Cotton', 'Linen', 'Chiffon', 'Georgette', 'Crepe']

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A–Z' },
]

export function ProductFilters() {
  const navigate = useNavigate()
  const { categorySlug, fabric: fabricParam, sortBy: sortByParam } = useParams<{ categorySlug?: string; fabric?: string; sortBy?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [stateFilterEnabled, setStateFilterEnabled] = useState(false)

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {})
    settingsApi.get('StateFilterEnabled')
      .then((s) => setStateFilterEnabled(s.value === 'true'))
      .catch(() => {})
  }, [])

  function buildPath(catSlug?: string, fab?: string, sort?: string, queryStr?: string) {
    let path = '/products'
    if (catSlug) path += `/category/${encodeURIComponent(catSlug)}`
    if (fab)     path += `/fabric/${fab}`
    if (sort)    path += `/sortBy/${sort}`
    return queryStr ? `${path}?${queryStr}` : path
  }

  function qs() {
    const p = new URLSearchParams(searchParams)
    p.delete('page')
    p.delete('sortBy')
    return p.toString()
  }

  function selectCategory(name?: string) {
    navigate(buildPath(name, fabricParam, sortByParam, qs()))
  }

  function selectFabric(fab?: string) {
    navigate(buildPath(categorySlug, fab, sortByParam, qs()))
  }

  function selectSort(sort?: string) {
    navigate(buildPath(categorySlug, fabricParam, sort, qs()))
  }

  function update(key: string, value: string | undefined) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page')
      return next
    })
  }

  function clearAll() {
    navigate('/products')
  }

  const selectedCategory = categorySlug ?? ''
  const selectedFabric = fabricParam ?? ''
  const selectedSort = sortByParam ?? ''
  const minPrice = searchParams.get('minPrice') ?? ''
  const maxPrice = searchParams.get('maxPrice') ?? ''
  const selectedState = searchParams.get('state') ?? ''
  const hasActiveFilters = !!(selectedCategory || selectedFabric || selectedSort || minPrice || maxPrice || selectedState)

  return (
    <aside className="w-full space-y-6">
      {/* Sort */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700 mb-2">Sort By</h3>
        <select
          value={selectedSort}
          onChange={(e) => selectSort(e.target.value || undefined)}
          className="w-full rounded border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none"
        >
          <option value="">Featured</option>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700 mb-2">Category</h3>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => selectCategory(undefined)}
                className={`text-sm ${!selectedCategory ? 'font-semibold text-primary-800' : 'text-gray-600 hover:text-primary-800'}`}
              >
                All
              </button>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => selectCategory(c.name)}
                  className={`text-sm ${selectedCategory === c.name ? 'font-semibold text-primary-800' : 'text-gray-600 hover:text-primary-800'}`}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Fabric */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700 mb-2">Fabric</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => selectFabric(undefined)}
              className={`text-sm ${!selectedFabric ? 'font-semibold text-primary-800' : 'text-gray-600 hover:text-primary-800'}`}
            >
              All
            </button>
          </li>
          {FABRICS.map((f) => (
            <li key={f}>
              <button
                onClick={() => selectFabric(f)}
                className={`text-sm ${selectedFabric === f ? 'font-semibold text-primary-800' : 'text-gray-600 hover:text-primary-800'}`}
              >
                {f}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* State filter — shown only when enabled in settings */}
      {stateFilterEnabled && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700 mb-2">State</h3>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => update('state', undefined)}
                className={`text-sm ${!selectedState ? 'font-semibold text-primary-800' : 'text-gray-600 hover:text-primary-800'}`}
              >
                All
              </button>
            </li>
            {INDIAN_STATES.map((s) => (
              <li key={s}>
                <button
                  onClick={() => update('state', s)}
                  className={`text-sm ${selectedState === s ? 'font-semibold text-primary-800' : 'text-gray-600 hover:text-primary-800'}`}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Price range */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700 mb-2">Price (₹)</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => update('minPrice', e.target.value || undefined)}
            className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm focus:border-primary-800 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => update('maxPrice', e.target.value || undefined)}
            className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm focus:border-primary-800 focus:outline-none"
          />
        </div>
      </div>

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="text-sm text-primary-800 underline hover:no-underline"
        >
          Clear all filters
        </button>
      )}
    </aside>
  )
}
