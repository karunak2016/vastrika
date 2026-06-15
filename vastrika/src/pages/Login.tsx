import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { authApi } from '../api/auth'
import { useAuthStore } from '../stores/authStore'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()
  const from = (location.state as { from?: string })?.from ?? '/'

  const [tab, setTab] = useState<'email' | 'otp'>('email')

  // Email/password
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // OTP
  const [otpPhone, setOtpPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpStep, setOtpStep] = useState<'phone' | 'verify'>('phone')
  const [otpError, setOtpError] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)

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

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setOtpError('')
    if (!/^\d{10}$/.test(otpPhone)) { setOtpError('Enter a valid 10-digit mobile number.'); return }
    setOtpLoading(true)
    try {
      await authApi.sendOtp({ phone: otpPhone })
      setOtpStep('verify')
    } catch {
      setOtpError('Failed to send OTP. Please try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setOtpError('')
    setOtpLoading(true)
    try {
      const res = await authApi.verifyOtp({ phone: otpPhone, otp: otpCode })
      setAuth({ name: res.name, email: res.email, role: res.role }, res.token)
      navigate(from, { replace: true })
    } catch {
      setOtpError('Invalid or expired OTP.')
    } finally {
      setOtpLoading(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="font-serif text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-500">Sign in to your House of Vastrikaa account</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => setTab('email')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === 'email' ? 'bg-primary-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Email & Password
          </button>
          <button
            onClick={() => { setTab('otp'); setOtpStep('phone'); setOtpError('') }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === 'otp' ? 'bg-primary-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Login with OTP
          </button>
        </div>

        {tab === 'email' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
            )}
            <Input id="email" type="email" label="Email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required autoComplete="email" />
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                  className="w-full rounded border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800 placeholder:text-gray-400"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" loading={loading}>Sign In</Button>
          </form>
        ) : (
          <div>
            {otpStep === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                {otpError && (
                  <div className="rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{otpError}</div>
                )}
                <p className="text-sm text-gray-500">Enter your registered mobile number to receive an OTP.</p>
                <div className="flex flex-col gap-1">
                  <label htmlFor="otpPhone" className="text-sm font-medium text-gray-700">Mobile Number</label>
                  <div className="flex">
                    <span className="flex items-center rounded-l border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">+91</span>
                    <input
                      id="otpPhone"
                      type="tel"
                      placeholder="9876543210"
                      value={otpPhone}
                      onChange={(e) => setOtpPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      maxLength={10}
                      required
                      className="flex-1 rounded-r border border-gray-300 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800 placeholder:text-gray-400"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" size="lg" loading={otpLoading}>Send OTP</Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {otpError && (
                  <div className="rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{otpError}</div>
                )}
                <p className="text-sm text-gray-500">
                  OTP sent to <span className="font-medium text-gray-700">+91 {otpPhone}</span>
                </p>
                <Input
                  id="otpCode"
                  label="Enter OTP"
                  placeholder="6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                />
                <Button type="submit" className="w-full" size="lg" loading={otpLoading}>Verify & Sign In</Button>
                <button
                  type="button"
                  onClick={() => { setOtpStep('phone'); setOtpCode(''); setOtpError('') }}
                  className="w-full text-sm text-gray-500 hover:text-primary-800"
                >
                  Change number
                </button>
              </form>
            )}
          </div>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary-800 hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  )
}
