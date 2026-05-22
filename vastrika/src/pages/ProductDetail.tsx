import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Heart, ShoppingBag, ChevronLeft, Truck } from 'lucide-react'
import type { Product } from '../types'
import { productsApi } from '../api/products'
import { cartApi } from '../api/cart'
import { wishlistApi } from '../api/wishlist'
import { shippingApi } from '../api/shipping'
import { useCartStore } from '../stores/cartStore'
import { useWishlistStore } from '../stores/wishlistStore'
import { useAuthStore } from '../stores/authStore'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [addingToCart, setAddingToCart] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [pincode, setPincode] = useState('')
  const [serviceMsg, setServiceMsg] = useState('')

  const { setCart, openDrawer } = useCartStore()
  const { isWishlisted, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!id) return
    setLoading(true)
    productsApi.getById(Number(id))
      .then(setProduct)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="flex justify-center py-32"><Spinner size="lg" /></div>
  }

  if (!product) {
    return (
      <div className="py-32 text-center">
        <p className="text-gray-500">Product not found.</p>
        <Link to="/products" className="mt-4 inline-block text-primary-800 hover:underline">Browse all sarees</Link>
      </div>
    )
  }

  const wishlisted = isWishlisted(product.id)
  const images = product.imageUrls ?? []
  const displayImage = images[activeImage] ?? product.defaultImageUrl

  async function handleAddToCart() {
    if (!isAuthenticated) return
    setAddingToCart(true)
    try {
      const cart = await cartApi.addItem({ productId: product!.id, quantity })
      setCart(cart)
      openDrawer()
    } finally {
      setAddingToCart(false)
    }
  }

  async function handleToggleWishlist() {
    if (!isAuthenticated) return
    if (wishlisted) {
      await wishlistApi.remove(product!.id)
      removeFromWishlist(product!.id)
    } else {
      await wishlistApi.add(product!.id)
      addToWishlist({
        productId: product!.id,
        productName: product!.name,
        imageUrl: product!.defaultImageUrl,
        price: product!.price,
      })
    }
  }

  async function checkPincode() {
    if (!pincode || pincode.length !== 6) return
    const res = await shippingApi.checkServiceability(pincode)
    setServiceMsg(
      res.serviceable
        ? `Delivery available. Estimated ${product!.deliveryDays} day(s).`
        : 'Delivery not available for this pincode',
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/products" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-800">
        <ChevronLeft className="h-4 w-4" /> Back to Sarees
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Images */}
        <div className="flex gap-3">
          {images.length > 1 && (
            <div className="flex flex-col gap-2">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-12 overflow-hidden rounded border-2 ${
                    activeImage === i ? 'border-primary-800' : 'border-transparent'
                  }`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover object-top" />
                </button>
              ))}
            </div>
          )}
          <div className="flex-1 overflow-hidden rounded-lg bg-cream-100 aspect-[3/4]">
            {displayImage ? (
              <img src={displayImage} alt={product.name} className="h-full w-full object-cover object-top" />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-300">
                <ShoppingBag className="h-16 w-16" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm uppercase tracking-wider text-gray-400">{product.categoryName}</p>
            <h1 className="mt-1 font-serif text-2xl font-bold text-gray-900 sm:text-3xl">{product.name}</h1>
            <p className="mt-1 text-sm text-gray-500">{product.fabric} · {product.color}</p>
            <p className="mt-3 text-2xl font-bold text-primary-800">
              ₹{(product.discountedPrice ?? product.price).toLocaleString('en-IN')}
            </p>
            {product.discountedPrice && (
              <p className="text-sm text-gray-400 line-through">₹{product.price.toLocaleString('en-IN')}</p>
            )}
          </div>

          {/* Stock */}
          {product.stockQuantity === 0 ? (
            <p className="text-sm font-medium text-red-600">Out of Stock</p>
          ) : product.stockQuantity <= 5 ? (
            <p className="text-sm font-medium text-orange-500">Only {product.stockQuantity} left!</p>
          ) : (
            <p className="text-sm text-green-600">In Stock</p>
          )}

          {/* Qty */}
          {product.stockQuantity > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Qty:</span>
              <div className="flex items-center gap-2 rounded border border-gray-200 px-2">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="py-1 text-gray-500 hover:text-primary-800"
                >
                  –
                </button>
                <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                  className="py-1 text-gray-500 hover:text-primary-800"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {isAuthenticated ? (
              <>
                <Button
                  size="lg"
                  className="flex-1"
                  loading={addingToCart}
                  disabled={product.stockQuantity === 0}
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="h-4 w-4" /> Add to Bag
                </Button>
                <button
                  onClick={handleToggleWishlist}
                  className="flex items-center gap-1 rounded border border-gray-200 px-4 py-2 hover:border-primary-800 hover:text-primary-800 transition-colors"
                >
                  <Heart className={`h-5 w-5 ${wishlisted ? 'fill-primary-800 text-primary-800' : 'text-gray-400'}`} />
                </button>
              </>
            ) : (
              <Link to="/login" className="flex-1">
                <Button size="lg" className="w-full">Login to Purchase</Button>
              </Link>
            )}
          </div>

          {/* Pincode check */}
          <div className="rounded-lg border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Check Delivery</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter pincode"
                value={pincode}
                onChange={(e) => { setPincode(e.target.value); setServiceMsg('') }}
                className="flex-1 rounded border border-gray-200 px-3 py-1.5 text-sm focus:border-primary-800 focus:outline-none"
              />
              <button
                onClick={checkPincode}
                className="rounded bg-primary-800 px-3 py-1.5 text-sm text-white hover:bg-primary-900"
              >
                Check
              </button>
            </div>
            {serviceMsg && <p className="mt-2 text-xs text-gray-600">{serviceMsg}</p>}
          </div>

          {/* Details */}
          {product.description && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">About this Saree</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}
          {product.careInstructions && (
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Care Instructions</h3>
              <p className="text-sm text-gray-600">{product.careInstructions}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
