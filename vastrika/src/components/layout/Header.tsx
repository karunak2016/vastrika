import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingBag, Heart, User, Search, Menu, X } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'
import { useWishlistStore } from '../../stores/wishlistStore'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const { user, isAuthenticated, logout } = useAuthStore()
  const { itemCount, openDrawer } = useCartStore()
  const { items: wishlistItems } = useWishlistStore()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  const navLink = 'text-sm font-medium text-gray-700 hover:text-primary-800 transition-colors'
  const activeNavLink = 'text-sm font-medium text-primary-800'

  // Show only first name (before space)
  const displayName = user?.name?.split(' ')[0] ?? ''

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="bg-primary-800 py-1.5 text-center text-xs text-white tracking-wide">
        Free shipping on orders above ₹1,999 &nbsp;|&nbsp; Authentic handcrafted sarees
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex-shrink-0">
            <span className="font-serif text-xl font-bold text-primary-800 tracking-wide">House of Vastrikaa</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" end className={({ isActive }) => (isActive ? activeNavLink : navLink)}>Home</NavLink>
            <NavLink to="/products" className={({ isActive }) => (isActive ? activeNavLink : navLink)}>Sarees</NavLink>
          </nav>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm">
            <div className="relative w-full">
              <input type="text" placeholder="Search sarees..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-full border border-gray-200 py-1.5 pl-4 pr-10 text-sm focus:border-primary-800 focus:outline-none" />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-800">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-1">
            <Link to="/wishlist" className="relative p-2 text-gray-600 hover:text-primary-800 transition-colors">
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-800 text-[10px] text-white">{wishlistItems.length}</span>
              )}
            </Link>

            <button onClick={openDrawer} className="relative p-2 text-gray-600 hover:text-primary-800 transition-colors">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-800 text-[10px] text-white">{itemCount > 9 ? '9+' : itemCount}</span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 rounded-full p-1.5 text-gray-600 hover:text-primary-800 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:block text-sm font-medium">{displayName}</span>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Profile</Link>
                      <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Orders</Link>
                      <hr className="my-1" />
                      <button onClick={() => { setUserMenuOpen(false); handleLogout() }} className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50">Logout</button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="hidden sm:inline-flex items-center gap-1 rounded border border-primary-800 px-3 py-1.5 text-sm font-medium text-primary-800 hover:bg-primary-50 transition-colors">
                Login
              </Link>
            )}

            <button className="p-2 md:hidden text-gray-600" onClick={() => setMobileOpen((v) => !v)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-gray-100 pb-4 md:hidden">
            <form onSubmit={handleSearch} className="mt-3">
              <div className="relative">
                <input type="text" placeholder="Search sarees..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-full border border-gray-200 py-2 pl-4 pr-10 text-sm focus:border-primary-800 focus:outline-none" />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><Search className="h-4 w-4" /></button>
              </div>
            </form>
            <nav className="mt-3 flex flex-col gap-1">
              <NavLink to="/" end onClick={() => setMobileOpen(false)} className="px-2 py-2 text-sm font-medium text-gray-700">Home</NavLink>
              <NavLink to="/products" onClick={() => setMobileOpen(false)} className="px-2 py-2 text-sm font-medium text-gray-700">Sarees</NavLink>
              {isAuthenticated ? (
                <>
                  <NavLink to="/profile" onClick={() => setMobileOpen(false)} className="px-2 py-2 text-sm font-medium text-gray-700">Profile</NavLink>
                  <NavLink to="/orders" onClick={() => setMobileOpen(false)} className="px-2 py-2 text-sm font-medium text-gray-700">Orders</NavLink>
                  <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="px-2 py-2 text-left text-sm font-medium text-red-600">Logout</button>
                </>
              ) : (
                <NavLink to="/login" onClick={() => setMobileOpen(false)} className="px-2 py-2 text-sm font-medium text-primary-800">Login / Register</NavLink>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
