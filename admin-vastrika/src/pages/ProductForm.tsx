import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Star } from 'lucide-react'
import type { Category, ProductRequest } from '../types'
import { productsApi } from '../api/products'
import { categoriesApi } from '../api/categories'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'

const empty: ProductRequest = { name: '', description: '', price: 0, categoryId: 0, fabric: '', color: '', stockQuantity: 0 }

export function ProductForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<ProductRequest>(empty)
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<{ url: string; isDefault: boolean }[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {})
    if (isEdit && id) {
      productsApi.getById(Number(id)).then((p) => {
        setForm({ name: p.name, description: p.description, price: p.price, categoryId: p.categoryId, fabric: p.fabric, color: p.color, stockQuantity: p.stockQuantity })
        setImages((p.imageUrls ?? []).map((url, i) => ({ url, isDefault: url === p.defaultImageUrl || i === 0 })))
      }).finally(() => setLoading(false))
    }
  }, [id, isEdit])

  function field(key: keyof ProductRequest) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const val = ['price', 'categoryId', 'stockQuantity'].includes(key) ? Number(e.target.value) : e.target.value
      setForm((f) => ({ ...f, [key]: val }))
    }
  }

  async function handleSave() {
    if (!form.name || !form.categoryId || form.price <= 0) {
      setError('Name, category, and price are required.')
      return
    }
    setError('')
    setSaving(true)
    try {
      if (isEdit && id) {
        await productsApi.update(Number(id), form)
      } else {
        await productsApi.create(form)
      }
      navigate('/products')
    } catch {
      setError('Failed to save product. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddImage() {
    if (!newImageUrl.trim() || !id) return
    const isDefault = images.length === 0
    await productsApi.addImage(Number(id), newImageUrl.trim(), isDefault)
    setImages((prev) => [...prev, { url: newImageUrl.trim(), isDefault }])
    setNewImageUrl('')
  }

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>

  return (
    <div className="max-w-2xl space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Basic details */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Product Details</h2>

        <Input id="name" label="Product Name" placeholder="Kanjivaram Silk Saree" value={form.name} onChange={field('name')} required />

        <div>
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Description</label>
          <textarea
            value={form.description}
            onChange={field('description')}
            rows={4}
            placeholder="Describe the saree..."
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Category</label>
            <select
              value={form.categoryId}
              onChange={field('categoryId')}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none"
            >
              <option value={0}>Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <Input id="price" type="number" label="Price (₹)" placeholder="1999" value={form.price || ''} onChange={field('price')} min={0} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input id="fabric" label="Fabric" placeholder="Silk" value={form.fabric} onChange={field('fabric')} />
          <Input id="color" label="Color" placeholder="Red" value={form.color} onChange={field('color')} />
          <Input id="stockQuantity" type="number" label="Stock" placeholder="10" value={form.stockQuantity || ''} onChange={field('stockQuantity')} min={0} />
        </div>
      </div>

      {/* Images (only in edit mode) */}
      {isEdit && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Product Images</h2>

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img.url} alt="" className="h-24 w-full rounded-lg object-cover object-top" />
                  {img.isDefault && (
                    <span className="absolute left-1 top-1 rounded bg-primary-800 px-1.5 py-0.5 text-[10px] text-white flex items-center gap-0.5">
                      <Star className="h-2.5 w-2.5" /> Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              id="imgUrl"
              placeholder="Paste image URL..."
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="flex-1"
            />
            <Button size="sm" variant="outline" onClick={handleAddImage}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
          <p className="text-xs text-gray-400">First image added becomes the primary image automatically.</p>
        </div>
      )}

      {!isEdit && (
        <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
          Save the product first, then you can add images from the edit page.
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button loading={saving} onClick={handleSave}>
          {isEdit ? 'Save Changes' : 'Create Product'}
        </Button>
        <Button variant="outline" onClick={() => navigate('/products')}>Cancel</Button>
      </div>
    </div>
  )
}
