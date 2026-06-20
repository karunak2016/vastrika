import { useEffect, useState } from 'react'
import { Plus, Trash2, MapPin, Pencil } from 'lucide-react'
import type { Address } from '../types'
import { addressesApi } from '../api/addresses'
import { authApi } from '../api/auth'
import { useAuthStore } from '../stores/authStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { INDIA_STATES, COUNTRIES } from '../lib/locationData'

// ── Form defaults ─────────────────────────────────────────────────────────────

const emptyForm = {
  fullName: '', phone: '', line1: '', line2: '',
  city: '', state: '', pincode: '', country: 'India',
}

// ── Select helper ─────────────────────────────────────────────────────────────

function Select({
  label, value, onChange, options, placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Profile() {
  const { user, setAuth, token } = useAuthStore()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  // Profile edit
  const isOtpUser = user?.email?.endsWith('@vastrikaa.local') ?? false
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: user?.name ?? '', email: '', phone: '' })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  function startEditProfile() {
    setProfileForm({ name: user?.name ?? '', email: isOtpUser ? '' : (user?.email ?? ''), phone: '' })
    setEditingProfile(true)
    setProfileMsg('')
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileSaving(true)
    try {
      const email = profileForm.email.trim() || user!.email
      const phone = profileForm.phone.trim() || undefined
      await authApi.updateProfile({ name: profileForm.name.trim(), email, phone })
      setAuth({ name: profileForm.name.trim(), email, role: user!.role }, token ?? '')
      setProfileMsg('Profile updated successfully.')
      setEditingProfile(false)
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? 'Unknown error'
      setProfileMsg(`Failed to update profile: ${msg}`)
    } finally {
      setProfileSaving(false)
    }
  }

  useEffect(() => {
    addressesApi.list().then(setAddresses).catch(() => {})
  }, [])

  function field(key: keyof typeof emptyForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  const isIndiaForm = form.country === 'India'

  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        fullName: form.fullName,
        phone: form.phone,
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        country: form.country,
      }
      if (editId) {
        await addressesApi.update(editId, payload)
        setAddresses((prev) =>
          prev.map((a) => a.id === editId ? { ...a, ...payload, line2: payload.line2 } : a)
        )
      } else {
        const created = await addressesApi.create({ ...payload, isDefault: addresses.length === 0 })
        setAddresses((prev) => [...prev, {
          id: created.id, userId: 0, ...payload,
          line2: payload.line2,
          isDefault: addresses.length === 0,
        }])
      }
      setForm(emptyForm)
      setShowForm(false)
      setEditId(null)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    await addressesApi.remove(id)
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  function startEdit(addr: Address) {
    setEditId(addr.id)
    setForm({
      fullName: addr.fullName,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 ?? '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country || 'India',
    })
    setShowForm(true)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-2xl font-bold text-gray-900 mb-8">My Profile</h1>

      {/* User info */}
      <div className="rounded-lg border border-gray-100 bg-white p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Account Details</h2>
          {!editingProfile && (
            <button onClick={startEditProfile} className="flex items-center gap-1 text-sm text-primary-800 hover:underline">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          )}
        </div>

        {isOtpUser && !editingProfile && (
          <div className="mb-4 rounded bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            You registered with mobile OTP. Add your email and name to complete your profile.
            <button onClick={startEditProfile} className="ml-2 font-medium underline">Update now</button>
          </div>
        )}

        {profileMsg && (
          <div className={`mb-4 rounded border px-4 py-3 text-sm ${profileMsg.startsWith('Failed') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>{profileMsg}</div>
        )}

        {editingProfile ? (
          <form onSubmit={saveProfile} className="space-y-3">
            <Input label="Full Name" value={profileForm.name} onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} required />
            <Input label="Email" type="email" value={profileForm.email} onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
              placeholder={isOtpUser ? 'Add your email address' : user?.email}
              required={isOtpUser}
            />
            <Input label="Phone (optional)" type="tel" value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} placeholder="10-digit mobile number" />
            <div className="flex gap-2 pt-1">
              <Button type="submit" size="sm" loading={profileSaving}>Save Changes</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setEditingProfile(false)}>Cancel</Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Name</p>
              <p className="font-medium text-gray-900">{user?.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{isOtpUser ? <span className="text-amber-600 italic">Not set</span> : user?.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Addresses */}
      <div className="rounded-lg border border-gray-100 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Saved Addresses
          </h2>
          <button
            onClick={() => { setShowForm((v) => !v); setEditId(null); setForm(emptyForm) }}
            className="flex items-center gap-1 text-sm font-medium text-primary-800 hover:underline"
          >
            <Plus className="h-4 w-4" /> Add New
          </button>
        </div>

        {/* Address form */}
        {showForm && (
          <div className="mb-6 space-y-3 rounded-lg bg-gray-50 p-4">
            <h3 className="text-sm font-medium text-gray-700">{editId ? 'Edit Address' : 'New Address'}</h3>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Full Name" value={form.fullName} onChange={field('fullName')} />
              <Input label="Phone" value={form.phone} onChange={field('phone')} />
            </div>

            <Input label="Address Line 1" value={form.line1} onChange={field('line1')} />
            <Input label="Address Line 2 (optional)" value={form.line2} onChange={field('line2')} />

            {/* Country dropdown */}
            <Select
              label="Country"
              value={form.country}
              onChange={(v) => setForm((f) => ({ ...f, country: v, state: '' }))}
              options={COUNTRIES}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input label="City" value={form.city} onChange={field('city')} />

              {/* State: dropdown for India, text for others */}
              {isIndiaForm ? (
                <Select
                  label="State / UT"
                  value={form.state}
                  onChange={(v) => setForm((f) => ({ ...f, state: v }))}
                  options={INDIA_STATES}
                  placeholder="Select state"
                />
              ) : (
                <Input label="State / Province / Region" value={form.state} onChange={field('state')} />
              )}
            </div>

            <Input
              label={isIndiaForm ? 'Pincode' : 'ZIP / Postal Code'}
              value={form.pincode}
              onChange={field('pincode')}
              placeholder={isIndiaForm ? '6-digit pincode' : 'Postal code'}
            />

            <div className="flex gap-2 pt-1">
              <Button size="sm" loading={saving} onClick={handleSave}>
                {editId ? 'Update' : 'Save'} Address
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setEditId(null) }}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Address list */}
        {addresses.length === 0 && !showForm ? (
          <p className="text-sm text-gray-400 text-center py-8">No saved addresses</p>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="rounded-lg border border-gray-100 p-4">
                <div className="flex justify-between">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{addr.fullName} · {addr.phone}</p>
                    <p className="text-gray-600">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                    <p className="text-gray-600">{addr.city}, {addr.state} – {addr.pincode}</p>
                    {addr.country && addr.country !== 'India' && (
                      <p className="text-gray-500">{addr.country}</p>
                    )}
                    {addr.isDefault && <span className="mt-1 inline-block text-xs text-primary-800 font-medium">Default</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(addr)} className="text-sm text-primary-800 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(addr.id)} className="text-gray-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
