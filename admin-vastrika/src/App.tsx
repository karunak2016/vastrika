import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { Layout } from './components/layout/Layout'

import { Login }          from './pages/Login'
import { Dashboard }      from './pages/Dashboard'
import { Products }       from './pages/Products'
import { ProductForm }    from './pages/ProductForm'
import { Categories }     from './pages/Categories'
import { Orders }         from './pages/Orders'
import { OrderDetail }    from './pages/OrderDetail'
import { Customers }      from './pages/Customers'
import { CustomerDetail } from './pages/CustomerDetail'
import { Coupons }        from './pages/Coupons'
import { Options }        from './pages/Options'

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <RequireAdmin>
              <Layout />
            </RequireAdmin>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="options" element={<Options />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
