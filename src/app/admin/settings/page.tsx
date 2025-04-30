'use client'

import { useState, useEffect } from 'react'

export default function WebsiteSettings() {
  const [settings, setSettings] = useState({
    title: '',
    description: '',
    keywords: '',
    logo: '',
    favicon: '',
    ads: { header: '', sidebar: '', footer: '' },
  })

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings')
        const data = await response.json()
        setSettings({
          ...data,
          ads: data.ads || { header: '', sidebar: '', footer: '' },
        })
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }

    fetchSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setMessage('Settings saved successfully!')
      } else {
        setMessage('Error saving settings. Please try again.')
      }
    } catch (error) {
      setMessage('Error saving settings. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name.startsWith('ads.')) {
      const slot = name.split('.')[1]
      setSettings(prev => ({ ...prev, ads: { ...prev.ads, [slot]: value } }))
    } else {
      setSettings(prev => ({ ...prev, [name]: value }))
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Website Settings</h1>
      
      {message && (
        <div className={`mt-4 p-4 rounded-md ${message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">General Settings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Basic information about your website.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Website Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={settings.title}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    value={settings.description}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
                    Keywords
                  </label>
                  <input
                    type="text"
                    name="keywords"
                    id="keywords"
                    value={settings.keywords}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Media</h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload your website logo and favicon.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                    Logo URL
                  </label>
                  <input
                    type="text"
                    name="logo"
                    id="logo"
                    value={settings.logo}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="favicon" className="block text-sm font-medium text-gray-700">
                    Favicon URL
                  </label>
                  <input
                    type="text"
                    name="favicon"
                    id="favicon"
                    value={settings.favicon}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Advertising</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add your advertising code for each slot.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <label htmlFor="adsHeader" className="block text-sm font-medium text-gray-700">
                    Header Ad Code
                  </label>
                  <textarea
                    name="ads.header"
                    id="adsHeader"
                    rows={2}
                    value={settings.ads.header}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md font-mono"
                  />
                </div>
                <div className="col-span-6">
                  <label htmlFor="adsSidebar" className="block text-sm font-medium text-gray-700">
                    Sidebar Ad Code
                  </label>
                  <textarea
                    name="ads.sidebar"
                    id="adsSidebar"
                    rows={2}
                    value={settings.ads.sidebar}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md font-mono"
                  />
                </div>
                <div className="col-span-6">
                  <label htmlFor="adsFooter" className="block text-sm font-medium text-gray-700">
                    Footer Ad Code
                  </label>
                  <textarea
                    name="ads.footer"
                    id="adsFooter"
                    rows={2}
                    value={settings.ads.footer}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
} 