import React from 'react'
import { Link } from 'react-router-dom'
import { PawPrint } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas px-6 text-center">
      <PawPrint size={28} className="text-ink-faint" />
      <h1 className="font-display text-xl font-semibold text-ink">Page not found</h1>
      <p className="text-sm text-ink-soft">The page you're looking for doesn't exist in this prototype.</p>
      <Link to="/dashboard" className="mt-2 rounded-sm bg-pasture-700 px-4 py-2 text-sm font-semibold text-white hover:bg-pasture-600">
        Back to Dashboard
      </Link>
    </div>
  )
}
