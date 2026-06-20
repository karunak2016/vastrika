import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { CartDrawer } from '../cart/CartDrawer'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'
import { useWishlistStore } from '../../stores/wishlistStore'
import { cartApi } from '../../api/cart'
import { wishlistApi } from '../../api/wishlist'

export function Layout() {
  const { isAuthenticated } = useAuthStore()
  const { setCart } = useCartStore()
  const { setItems } = useWishlistStore()

  useEffect(() => {
    if (!isAuthenticated) return
    cartApi.get().then(setCart).catch(() => {})
    wishlistApi.get().then(setItems).catch(() => {})
  }, [isAuthenticated])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
