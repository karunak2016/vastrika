import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from './components/layout/Layout'
import { useAuthStore } from './stores/authStore'

// Pages
import { Home } from './pages/Home'
import { Products } from './pages/Products'
import { ProductDetail } from './pages/ProductDetail'
import { Cart } from './pages/Cart'
import { Wishlist } from './pages/Wishlist'
import { Checkout } from './pages/Checkout'
import { Orders } from './pages/Orders'
import { OrderDetail } from './pages/OrderDetail'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Profile } from './pages/Profile'
import { TrackOrder } from './pages/TrackOrder'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
})

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Public */}
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="products/sortBy/:sortBy" element={<Products />} />
            <Route path="products/fabric/:fabric" element={<Products />} />
            <Route path="products/fabric/:fabric/sortBy/:sortBy" element={<Products />} />
            <Route path="products/category/:categorySlug" element={<Products />} />
            <Route path="products/category/:categorySlug/sortBy/:sortBy" element={<Products />} />
            <Route path="products/category/:categorySlug/fabric/:fabric" element={<Products />} />
            <Route path="products/category/:categorySlug/fabric/:fabric/sortBy/:sortBy" element={<Products />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="track" element={<TrackOrder />} />
            <Route path="track/:awbCode" element={<TrackOrder />} />

            {/* Protected */}
            <Route path="cart" element={<RequireAuth><Cart /></RequireAuth>} />
            <Route path="wishlist" element={<RequireAuth><Wishlist /></RequireAuth>} />
            <Route path="checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
            <Route path="orders" element={<RequireAuth><Orders /></RequireAuth>} />
            <Route path="orders/:id" element={<RequireAuth><OrderDetail /></RequireAuth>} />
            <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
