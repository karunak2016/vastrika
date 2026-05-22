import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import type { Category } from '../types'
import { categoriesApi } from '../api/categories'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { Badge } from '../components/ui/Badge'

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    categoriesApi.list().then(setCategories).finally(() => setLoading(false))
  }, [])

  async function handleCreate() {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const created = await categoriesApi.create({ name: form.name, description: form.description || undefined })
      setCategories((prev) => [...prev, created])
      setForm({ name: '', description: '' })
      setShowAdd(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(id: number) {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const updated = await categoriesApi.update(id, { name: form.name, description: form.description || undefined })
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)))
      setEditId(null)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this category?')) return
    await categoriesApi.remove(id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  function startEdit(cat: Category) {
    setEditId(cat.id)
    setForm({ name: cat.name, description: cat.description ?? '' })
    setShowAdd(false)
  }

  return (
    <div className="max-w-2xl space-y-4">
      {/* Add button */}
      {!showAdd && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { setShowAdd(true); setEditId(null); setForm({ name: '', description: '' }) }}>
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">New Category</h2>
          <Input id="catName" label="Name" placeholder="e.g. Silk Sarees" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input id="catDesc" label="Description (optional)" placeholder="Brief description..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <div className="flex gap-2">
            <Button size="sm" loading={saving} onClick={handleCreate}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : categories.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">No categories yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    {editId === cat.id ? (
                      <input
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-primary-800 focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium text-gray-900">{cat.name}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {editId === cat.id ? (
                      <input
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-primary-800 focus:outline-none"
                      />
                    ) : (
                      cat.description ?? '—'
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <Badge variant={cat.isActive ? 'success' : 'danger'}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {editId === cat.id ? (
                        <>
                          <button onClick={() => handleUpdate(cat.id)} disabled={saving} className="rounded p-1.5 text-green-600 hover:bg-green-50">
                            <Check className="h-4 w-4" />
                          </button>
                          <button onClick={() => setEditId(null)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100">
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(cat)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary-800">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(cat.id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
