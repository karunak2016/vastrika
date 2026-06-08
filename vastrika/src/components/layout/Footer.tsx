import { Link } from 'react-router-dom'
import { Instagram, Facebook, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <span className="font-serif text-lg font-bold text-white">House of Vastrikaa</span>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Authentic handcrafted sarees celebrating India's rich textile heritage.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" aria-label="Instagram" className="hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" aria-label="Facebook" className="hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="mailto:hello@houseofvastrikaa.com" aria-label="Email" className="hover:text-white transition-colors"><Mail className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Shop</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-white transition-colors">All Sarees</Link></li>
              <li><Link to="/products/fabric/Silk" className="hover:text-white transition-colors">Silk Sarees</Link></li>
              <li><Link to="/products/fabric/Cotton" className="hover:text-white transition-colors">Cotton Sarees</Link></li>
              <li><Link to="/products/sortBy/newest" className="hover:text-white transition-colors">New Arrivals</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Account</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">My Orders</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Support</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/track" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><a href="mailto:support@houseofvastrikaa.com" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} House of Vastrikaa. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
