'use client'

import { useEffect, useState } from 'react'
import { clientStorage } from '@/lib/client-storage'

export function StorageInit({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        // Initialize with sample data
        await clientStorage.initialize()
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize storage:', error)
        setIsInitialized(true) // Continue anyway
      }
    }

    initializeStorage()
  }, [])

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
