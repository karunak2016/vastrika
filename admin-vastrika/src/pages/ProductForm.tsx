import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Star, Upload, X } from 'lucide-react'
import type { Category, ProductImage, ProductRequest } from '../types'
import { productsApi } from '../api/products'
import { categoriesApi } from '../api/categories'
import { uploadApi } from '../api/upload'
import { optionsApi, type ProductOption } from '../api/options'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

const empty: ProductRequest = { name: '', description: '', price: 0, categoryId: 0, fabric: '', color: '', stockQuantity: 0, state: '' }

export function ProductForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<ProductRequest>(empty)
  const [categories, setCategories] = useState<Category[]>([])
  const [fabrics, setFabrics] = useState<ProductOption[]>([])
  const [colors, setColors] = useState<ProductOption[]>([])
  const [images, setImages] = useState<ProductImage[]>([])
  const [pendingImages, setPendingImages] = useState<ProductImage[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {})
    optionsApi.getFabrics().then(setFabrics).catch(() => {})
    optionsApi.getColors().then(setColors).catch(() => {})
    if (isEdit && id) {
      productsApi.getById(Number(id)).then((p) => {
        setForm({ name: p.name, description: p.description, price: p.price, categoryId: p.categoryId, fabric: p.fabric, color: p.color, state: p.state ?? '', stockQuantity: p.stockQuantity })
        setImages(p.images ?? (p.imageUrls ?? []).map((url, i) => ({ id: -(i + 1), url, isDefault: url === p.defaultImageUrl || i === 0 })))
      }).finally(() => setLoading(false))
    }
  }, [id, isEdit])

  function field(key: keyof ProductRequest) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const val = ['price', 'categoryId', 'stockQuantity'].includes(key) ? Number(e.target.value) : e.target.value
      setForm((f) => ({ ...f, [key]: val }))
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setUploadingImage(true)
    setError('')
    try {
      const url = await uploadApi.uploadImage(file)
      if (isEdit && id) {
        const isDefault = images.length === 0
        const imageId = await productsApi.addImage(Number(id), url, isDefault)
        setImages((prev) => [...prev, { id: imageId, url, isDefault }])
      } else {
        const tempId = -(pendingImages.length + 1)
        setPendingImages((prev) => [...prev, { id: tempId, url, isDefault: prev.length === 0 }])
      }
    } catch {
      setError('Image upload failed. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleDeleteImage(img: ProductImage) {
    if (isEdit && id) {
      if (img.id < 0) return
      setDeletingImageId(img.id)
      try {
        await productsApi.removeImage(Number(id), img.id)
        setImages((prev) => prev.filter((i) => i.id !== img.id))
      } catch {
        setError('Failed to delete image. Please try again.')
      } finally {
        setDeletingImageId(null)
      }
    } else {
      setPendingImages((prev) => {
        const updated = prev.filter((i) => i.id !== img.id)
        return updated.map((i, idx) => ({ ...i, isDefault: idx === 0 }))
      })
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
        const created = await productsApi.create(form)
        for (let i = 0; i < pendingImages.length; i++) {
          await productsApi.addImage(created.id, pendingImages[i].url, i === 0)
        }
      }
      navigate('/products')
    } catch {
      setError('Failed to save product. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>

  const displayImages = isEdit ? images : pendingImages

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
          <div>
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Fabric</label>
            <select
              value={form.fabric}
              onChange={field('fabric')}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none"
            >
              <option value="">Select fabric</option>
              {fabrics.map((f) => (
                <option key={f.id} value={f.value}>{f.value}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Color</label>
            <select
              value={form.color}
              onChange={field('color')}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none"
            >
              <option value="">Select color</option>
              {colors.map((c) => (
                <option key={c.id} value={c.value}>{c.value}</option>
              ))}
            </select>
          </div>
          <Input id="stockQuantity" type="number" label="Stock" placeholder="10" value={form.stockQuantity || ''} onChange={field('stockQuantity')} min={0} />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">State <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
          <select
            value={form.state ?? ''}
            onChange={field('state')}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none"
          >
            <option value="">No specific state</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Images */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Product Images</h2>

        {displayImages.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {displayImages.map((img) => (
              <div key={img.id} className="relative group">
                <img src={img.url} alt="" className="h-24 w-full rounded-lg object-cover object-top" />
                {img.isDefault && (
                  <span className="absolute left-1 top-1 rounded bg-primary-800 px-1.5 py-0.5 text-[10px] text-white flex items-center gap-0.5">
                    <Star className="h-2.5 w-2.5" /> Primary
                  </span>
                )}
                <button
                  onClick={() => handleDeleteImage(img)}
                  disabled={deletingImageId === img.id}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                >
                  {deletingImageId === img.id
                    ? <Spinner size="sm" />
                    : <X className="h-3 w-3" />}
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          loading={uploadingImage}
        >
          <Upload className="h-4 w-4" />
          {uploadingImage ? 'Uploading...' : 'Upload Image'}
        </Button>
        <p className="text-xs text-gray-400">
          Accepted: JPEG, PNG, WebP. First image becomes the primary.
          {!isEdit && pendingImages.length > 0 && ` ${pendingImages.length} image${pendingImages.length > 1 ? 's' : ''} will be saved with the product.`}
        </p>
      </div>

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
