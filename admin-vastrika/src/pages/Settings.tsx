import { useEffect, useState } from 'react'
import { settingsApi } from '../api/settings'
import { Spinner } from '../components/ui/Spinner'

export function Settings() {
  const [stateFilterEnabled, setStateFilterEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    settingsApi
      .get('StateFilterEnabled')
      .then((s) => setStateFilterEnabled(s.value === 'true'))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleToggle() {
    const next = !stateFilterEnabled
    setSaving(true)
    try {
      await settingsApi.set('StateFilterEnabled', next ? 'true' : 'false')
      setStateFilterEnabled(next)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>

  return (
    <div className="max-w-xl space-y-4">
      <p className="text-sm text-gray-500">Control customer-facing features on the storefront.</p>

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
            disabled={saving}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-60 ${
              stateFilterEnabled ? 'bg-primary-800' : 'bg-gray-200'
            }`}
          >
            {saving ? (
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
