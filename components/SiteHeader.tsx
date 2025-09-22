'use client'

import React from 'react'
import Link from 'next/link'

type Props = {
  /** Optional small line under the brand, e.g. on Blog: "Click the logo to return to the homepage." */
  subline?: React.ReactNode
}

export default function SiteHeader({ subline }: Props) {
  return (
    <header className="border-b border-white/20 bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Brand (match homepage 1:1) */}
          <div className="flex flex-col">
            <Link
              href="/"
              prefetch={false}
              className="flex items-center space-x-2 hover:opacity-90"
              aria-label="Go to homepage"
            >
              <img
                src="/favicon.svg"
                width={28}
                height={28}
                alt="CardSpark — Digital Business Card logo"
              />
              <span className="text-2xl font-bold text-gray-900">CardSpark</span>
            </Link>
            {subline ? <p className="mt-1 text-xs text-gray-500">{subline}</p> : null}
          </div>

          {/* Right nav (match homepage 1:1) */}
          <nav className="flex items-center space-x-6">
            <Link href="/blog" prefetch={false} className="text-sm font-medium text-gray-700 hover:underline">
              Blog
            </Link>
            <Link href="/feedback" prefetch={false} className="text-sm font-medium text-gray-700 hover:underline">
              Contact
            </Link>
            <Link href="/privacy" prefetch={false} className="text-sm font-medium text-gray-700 hover:underline">
              Privacy Policy
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}