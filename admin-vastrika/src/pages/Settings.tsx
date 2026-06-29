import { useEffect, useState } from 'react'
import { settingsApi } from '../api/settings'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'

export function Settings() {
  const [stateFilterEnabled, setStateFilterEnabled] = useState(false)
  const [shippingFee, setShippingFee] = useState('99')
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('1999')
  const [loading, setLoading] = useState(true)
  const [savingToggle, setSavingToggle] = useState(false)
  const [savingShipping, setSavingShipping] = useState(false)
  const [shippingSaved, setShippingSaved] = useState(false)

  useEffect(() => {
    Promise.all([
      settingsApi.get('StateFilterEnabled').catch(() => ({ value: 'false' })),
      settingsApi.getShipping().catch(() => ({ shippingFee: 99, freeShippingThreshold: 1999 })),
    ]).then(([state, shipping]) => {
      setStateFilterEnabled((state as any).value === 'true')
      setShippingFee(String(shipping.shippingFee))
      setFreeShippingThreshold(String(shipping.freeShippingThreshold))
    }).finally(() => setLoading(false))
  }, [])

  async function handleToggle() {
    const next = !stateFilterEnabled
    setSavingToggle(true)
    try {
      await settingsApi.set('StateFilterEnabled', next ? 'true' : 'false')
      setStateFilterEnabled(next)
    } finally {
      setSavingToggle(false)
    }
  }

  async function handleSaveShipping() {
    setSavingShipping(true)
    setShippingSaved(false)
    try {
      await Promise.all([
        settingsApi.set('ShippingFee', shippingFee || '0'),
        settingsApi.set('FreeShippingThreshold', freeShippingThreshold || '0'),
      ])
      setShippingSaved(true)
      setTimeout(() => setShippingSaved(false), 3000)
    } finally {
      setSavingShipping(false)
    }
  }

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>

  return (
    <div className="max-w-xl space-y-6">
      <p className="text-sm text-gray-500">Control customer-facing features on the storefront.</p>

      {/* Shipping */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Shipping</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Shipping Fee (₹)</label>
            <input
              type="number"
              min="0"
              value={shippingFee}
              onChange={(e) => setShippingFee(e.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Free Shipping Above (₹)</label>
            <input
              type="number"
              min="0"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none"
            />
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Customers pay ₹{shippingFee} shipping. Free if order subtotal ≥ ₹{freeShippingThreshold}.
          Set shipping fee to 0 for always-free shipping.
        </p>

        <div className="flex items-center gap-3">
          <Button size="sm" loading={savingShipping} onClick={handleSaveShipping}>
            Save Shipping Settings
          </Button>
          {shippingSaved && <span className="text-xs text-green-600 font-medium">Saved!</span>}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Filters</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">Enable State Filter</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Shows a state dropdown on the products page so customers can filter sarees by state.
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={savingToggle}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-60 ${
              stateFilterEnabled ? 'bg-primary-800' : 'bg-gray-200'
            }`}
          >
            {savingToggle ? (
              <span className="absolute inset-0 flex items-center justify-center">
                <Spinner size="sm" />
              </span>
            ) : (
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  stateFilterEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
