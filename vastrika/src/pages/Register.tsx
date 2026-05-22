import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useAuthStore } from '../stores/authStore'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function Register() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      const res = await authApi.register({ name: form.name, email: form.email, phone: form.phone || undefined, password: form.password })
      setAuth({ name: res.name, email: res.email, role: res.role }, res.token)
      navigate('/')
    } catch {
      setError('Registration failed. Email may already be in use.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-sm text-gray-500">Join House of Vastrikaa today</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          <Input id="name" label="Full Name" placeholder="Priya Sharma" value={form.name} onChange={field('name')} required />
          <Input id="email" type="email" label="Email" placeholder="you@example.com" value={form.email} onChange={field('email')} required autoComplete="email" />
          <Input id="phone" type="tel" label="Phone (optional)" placeholder="9876543210" value={form.phone} onChange={field('phone')} />
          <Input id="password" type="password" label="Password" placeholder="Min 8 characters" value={form.password} onChange={field('password')} required minLength={8} autoComplete="new-password" />
          <Input id="confirmPassword" type="password" label="Confirm Password" placeholder="••••••••" value={form.confirmPassword} onChange={field('confirmPassword')} required autoComplete="new-password" />
          <Button type="submit" className="w-full" size="lg" loading={loading}>Create Account</Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-800 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
