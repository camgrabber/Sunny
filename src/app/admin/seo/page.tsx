'use client'

import { useState, useEffect } from 'react'

export default function SEOSettings() {
  const [settings, setSettings] = useState({
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    seoImage: '',
    seoRobots: '',
    seoCanonical: '',
    seoOgTitle: '',
    seoOgDescription: '',
    seoOgImage: '',
    seoTwitterTitle: '',
    seoTwitterDescription: '',
    seoTwitterImage: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/seo')
        const data = await response.json()
        setSettings(data)
      } catch (error) {
        console.error('Error fetching SEO settings:', error)
      }
    }

    fetchSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setMessage('SEO settings saved successfully!')
      } else {
        setMessage('Error saving SEO settings. Please try again.')
      }
    } catch (error) {
      setMessage('Error saving SEO settings. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSettings(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">SEO Settings</h1>
      
      {message && (
        <div className={`mt-4 p-4 rounded-md ${message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Basic SEO</h3>
              <p className="mt-1 text-sm text-gray-500">
                Basic SEO settings for your website.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    name="seoTitle"
                    id="seoTitle"
                    value={settings.seoTitle}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700">
                    Meta Description
                  </label>
                  <textarea
                    name="seoDescription"
                    id="seoDescription"
                    rows={3}
                    value={settings.seoDescription}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="seoKeywords" className="block text-sm font-medium text-gray-700">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    name="seoKeywords"
                    id="seoKeywords"
                    value={settings.seoKeywords}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="seoImage" className="block text-sm font-medium text-gray-700">
                    Default SEO Image
                  </label>
                  <input
                    type="text"
                    name="seoImage"
                    id="seoImage"
                    value={settings.seoImage}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="seoRobots" className="block text-sm font-medium text-gray-700">
                    Robots Meta Tag
                  </label>
                  <input
                    type="text"
                    name="seoRobots"
                    id="seoRobots"
                    value={settings.seoRobots}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="seoCanonical" className="block text-sm font-medium text-gray-700">
                    Canonical URL
                  </label>
                  <input
                    type="text"
                    name="seoCanonical"
                    id="seoCanonical"
                    value={settings.seoCanonical}
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
              <h3 className="text-lg font-medium leading-6 text-gray-900">Open Graph</h3>
              <p className="mt-1 text-sm text-gray-500">
                Settings for social media sharing.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <label htmlFor="seoOgTitle" className="block text-sm font-medium text-gray-700">
                    OG Title
                  </label>
                  <input
                    type="text"
                    name="seoOgTitle"
                    id="seoOgTitle"
                    value={settings.seoOgTitle}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="seoOgDescription" className="block text-sm font-medium text-gray-700">
                    OG Description
                  </label>
                  <textarea
                    name="seoOgDescription"
                    id="seoOgDescription"
                    rows={3}
                    value={settings.seoOgDescription}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="seoOgImage" className="block text-sm font-medium text-gray-700">
                    OG Image
                  </label>
                  <input
                    type="text"
                    name="seoOgImage"
                    id="seoOgImage"
                    value={settings.seoOgImage}
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
              <h3 className="text-lg font-medium leading-6 text-gray-900">Twitter Card</h3>
              <p className="mt-1 text-sm text-gray-500">
                Settings for Twitter sharing.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <label htmlFor="seoTwitterTitle" className="block text-sm font-medium text-gray-700">
                    Twitter Title
                  </label>
                  <input
                    type="text"
                    name="seoTwitterTitle"
                    id="seoTwitterTitle"
                    value={settings.seoTwitterTitle}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="seoTwitterDescription" className="block text-sm font-medium text-gray-700">
                    Twitter Description
                  </label>
                  <textarea
                    name="seoTwitterDescription"
                    id="seoTwitterDescription"
                    rows={3}
                    value={settings.seoTwitterDescription}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="seoTwitterImage" className="block text-sm font-medium text-gray-700">
                    Twitter Image
                  </label>
                  <input
                    type="text"
                    name="seoTwitterImage"
                    id="seoTwitterImage"
                    value={settings.seoTwitterImage}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
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
            {isLoading ? 'Saving...' : 'Save SEO Settings'}
          </button>
        </div>
      </form>
    </div>
  )
} 