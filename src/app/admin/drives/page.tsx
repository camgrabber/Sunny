'use client'

import { useEffect, useState } from 'react'

export default function AdminDrivesPage() {
  const [drives, setDrives] = useState<any[]>([])
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [editingName, setEditingName] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchDrives()
  }, [])

  const fetchDrives = async () => {
    const res = await fetch('/api/admin/drives')
    const data = await res.json()
    setDrives(data)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let res
      if (editingName) {
        res = await fetch(`/api/admin/drives/${editingName}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      } else {
        res = await fetch('/api/admin/drives', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      }
      if (res.ok) {
        setMessage('Drive saved!')
        setForm({ name: '', email: '', password: '' })
        setEditingName(null)
        fetchDrives()
      } else {
        setMessage('Error saving drive.')
      }
    } catch {
      setMessage('Error saving drive.')
    }
  }

  const handleEdit = (drive: any) => {
    setForm({ name: drive.name, email: drive.email, password: drive.password })
    setEditingName(drive.name)
  }

  const handleDelete = async (name: string) => {
    if (!confirm('Delete this drive?')) return
    await fetch(`/api/admin/drives/${name}`, { method: 'DELETE' })
    fetchDrives()
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Cloud Drives</h1>
      {message && <div className="mb-4 text-green-600">{message}</div>}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4 bg-white p-4 rounded shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">Drive Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="mt-1 block w-full border rounded p-2" required disabled={!!editingName} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input name="email" value={form.email} onChange={handleChange} className="mt-1 block w-full border rounded p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input name="password" value={form.password} onChange={handleChange} className="mt-1 block w-full border rounded p-2" required type="password" />
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
          {editingName ? 'Update Drive' : 'Add Drive'}
        </button>
        {editingName && (
          <button type="button" onClick={() => { setEditingName(null); setForm({ name: '', email: '', password: '' }) }} className="ml-2 px-4 py-2 rounded bg-gray-300">Cancel</button>
        )}
      </form>
      <div className="bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {drives.map((drive) => (
              <tr key={drive.name}>
                <td className="px-6 py-4 whitespace-nowrap">{drive.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{drive.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">••••••••</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(drive)} className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                  <button onClick={() => handleDelete(drive.name)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 