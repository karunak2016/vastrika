import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { authApi } from '../api/auth'
import { useAuthStore } from '../stores/authStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

type Mode = 'unknown' | 'email' | 'otp-send' | 'otp-verify'

function isPhone(v: string) { return /^\d{10}$/.test(v.trim()) }
function isEmail(v: string) { return v.includes('@') && !v.endsWith('@vastrikaa.local') }

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()
  const from = (location.state as { from?: string })?.from ?? '/'

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Derive mode from what the user has typed
  const mode: Mode = isPhone(identifier)
    ? 'otp-send'
    : isEmail(identifier)
      ? 'email'
      : 'unknown'

  function handleIdentifierChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setIdentifier(val)
    setError('')
    setOtpCode('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'email') {
        const res = await authApi.login({ email: identifier.trim(), password })
        setAuth({ name: res.name, email: res.email, role: res.role }, res.token)
        navigate(from, { replace: true })
      } else if (mode === 'otp-send') {
        await authApi.sendOtp({ phone: identifier.trim() })
        setIdentifier((v) => v) // keep value, trigger re-render to otp-verify
        // switch mode by appending space trick — instead use separate state
        setOtpSent(true)
      }
    } catch {
      setError(mode === 'email' ? 'Invalid email or password.' : 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const [otpSent, setOtpSent] = useState(false)

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.verifyOtp({ phone: identifier.trim(), otp: otpCode })
      setAuth({ name: res.name, email: res.email, role: res.role }, res.token)
      navigate(from, { replace: true })
    } catch {
      setError('Invalid or expired OTP.')
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

        {error && (
          <div className="mb-4 rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="identifier" className="text-sm font-medium text-gray-700">
                Email or Mobile Number
              </label>
              <input
                id="identifier"
                type="text"
                placeholder="you@example.com or 9876543210"
                value={identifier}
                onChange={handleIdentifierChange}
                required
                autoComplete="username"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800 placeholder:text-gray-400"
              />
              {isPhone(identifier) && (
                <p className="text-xs text-primary-800">We'll send an OTP to +91 {identifier}</p>
              )}
            </div>

            {mode === 'email' && (
              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full rounded border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800 placeholder:text-gray-400"
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
              disabled={mode === 'unknown'}
            >
              {mode === 'otp-send' ? 'Send OTP' : 'Sign In'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-gray-500">
              OTP sent to <span className="font-medium text-gray-700">+91 {identifier}</span>
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
            <Button type="submit" className="w-full" size="lg" loading={loading}>Verify & Sign In</Button>
            <button
              type="button"
              onClick={() => { setOtpSent(false); setOtpCode(''); setError('') }}
              className="w-full text-sm text-gray-500 hover:text-primary-800"
            >
              Change number
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary-800 hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  )
}
