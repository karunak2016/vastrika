import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Package, Tag, ShoppingCart, Users, X, Ticket, Sliders, Settings,
} from 'lucide-react'
import { cn } from '../../utils/cn'

const links = [
  { to: '/',           label: 'Dashboard',  icon: LayoutDashboard, end: true },
  { to: '/products',   label: 'Products',   icon: Package },
  { to: '/categories', label: 'Categories', icon: Tag },
  { to: '/orders',     label: 'Orders',     icon: ShoppingCart },
  { to: '/customers',  label: 'Customers',  icon: Users },
  { to: '/coupons',    label: 'Coupons',    icon: Ticket },
  { to: '/options',    label: 'Options',    icon: Sliders },
  { to: '/settings',  label: 'Settings',   icon: Settings },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-30 flex h-full w-60 flex-col bg-gray-900 text-white transition-transform duration-200 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-gray-700">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Admin Panel</p>
            <p className="text-sm font-bold text-white">House of Vastrikaa</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                )
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">© 2026 House of Vastrikaa</p>
        </div>
      </aside>
    </>
  )
}
