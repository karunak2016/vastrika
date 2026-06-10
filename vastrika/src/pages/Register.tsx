import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { authApi } from '../api/auth'
import { useAuthStore } from '../stores/authStore'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function Register() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [tab, setTab] = useState<'full' | 'otp'>('full')

  // Full registration
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // OTP flow (Firebase)
  const [otpPhone, setOtpPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpStep, setOtpStep] = useState<'phone' | 'verify'>('phone')
  const [otpError, setOtpError] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null)
  const confirmRef = useRef<ConfirmationResult | null>(null)

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleFullRegister(e: React.FormEvent) {
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

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setOtpError('')
    if (!/^\d{10}$/.test(otpPhone)) { setOtpError('Enter a valid 10-digit mobile number.'); return }
    setOtpLoading(true)
    try {
      // Always create a fresh verifier to avoid stale reCAPTCHA state
      recaptchaRef.current?.clear()
      recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        'expired-callback': () => {
          recaptchaRef.current?.clear()
          recaptchaRef.current = null
        },
      })
      await recaptchaRef.current.render() // must render before use
      confirmRef.current = await signInWithPhoneNumber(auth, `+91${otpPhone}`, recaptchaRef.current)
      setOtpStep('verify')
    } catch (err: any) {
      recaptchaRef.current?.clear()
      recaptchaRef.current = null
      console.error('Firebase OTP error:', err?.code, err?.message)
      const msg = err?.code === 'auth/too-many-requests'
        ? 'Too many attempts. Please try again later.'
        : err?.code === 'auth/invalid-phone-number'
          ? 'Invalid phone number format.'
          : err?.code === 'auth/operation-not-allowed'
            ? 'Phone sign-in is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.'
            : err?.code === 'auth/captcha-check-failed'
              ? 'reCAPTCHA failed. Disable reCAPTCHA Enterprise in Firebase Console → Authentication → Settings.'
              : `Failed to send OTP. (${err?.code ?? 'unknown'})`
      setOtpError(msg)
    } finally {
      setOtpLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setOtpError('')
    setOtpLoading(true)
    try {
      const result = await confirmRef.current!.confirm(otpCode)
      const idToken = await result.user.getIdToken()
      const res = await authApi.loginWithFirebase({ idToken })
      setAuth({ name: res.name, email: res.email, role: res.role }, res.token)
      navigate('/')
    } catch {
      setOtpError('Invalid OTP. Please try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="font-serif text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-sm text-gray-500">Join House of Vastrikaa today</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => setTab('full')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === 'full' ? 'bg-primary-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Sign Up
          </button>
          <button
            onClick={() => { setTab('otp'); setOtpStep('phone'); setOtpError('') }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === 'otp' ? 'bg-primary-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Login with OTP
          </button>
        </div>

        {tab === 'full' ? (
          <form onSubmit={handleFullRegister} className="space-y-4">
            {error && (
              <div className="rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
            )}
            <Input id="name" label="Full Name" placeholder="Priya Sharma" value={form.name} onChange={field('name')} required />
            <Input id="email" type="email" label="Email" placeholder="you@example.com" value={form.email} onChange={field('email')} required autoComplete="email" />
            <Input id="phone" type="tel" label="Phone (optional)" placeholder="9876543210" value={form.phone} onChange={field('phone')} />

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={field('password')}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800 placeholder:text-gray-400"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={field('confirmPassword')}
                  required
                  autoComplete="new-password"
                  className="w-full rounded border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800 placeholder:text-gray-400"
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>Create Account</Button>
          </form>
        ) : (
          <div>
            {otpStep === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                {otpError && (
                  <div className="rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{otpError}</div>
                )}
                <div className="text-sm text-gray-500 mb-2">
                  Enter your mobile number to get a one-time password. No email or password needed.
                </div>
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
                <div className="text-sm text-gray-500">
                  OTP sent to <span className="font-medium text-gray-700">+91 {otpPhone}</span>
                </div>
                <Input
                  id="otpCode"
                  label="Enter OTP"
                  placeholder="6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                />
                <Button type="submit" className="w-full" size="lg" loading={otpLoading}>Verify & Continue</Button>
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
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-800 hover:underline">Sign in</Link>
        </p>
      </div>
      <div id="recaptcha-container" />
    </div>
  )
}
