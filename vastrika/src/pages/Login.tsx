import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useAuthStore } from '../stores/authStore'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()
  const from = (location.state as { from?: string })?.from ?? '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login(form)
      setAuth({ name: res.name, email: res.email, role: res.role }, res.token)
      navigate(from, { replace: true })
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-500">Sign in to your House of Vastrikaa account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          <Input id="email" type="email" label="Email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required autoComplete="email" />
          <Input id="password" type="password" label="Password" placeholder="••••••••" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required autoComplete="current-password" />
          <Button type="submit" className="w-full" size="lg" loading={loading}>Sign In</Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary-800 hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  )
}
