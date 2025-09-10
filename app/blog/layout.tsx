import React from 'react'
import SiteHeader from '@/components/SiteHeader'

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <SiteHeader subline="Click the logo to return to the homepage." />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* keep reading width comfortable */}
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}