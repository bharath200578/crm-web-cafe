import { NextResponse } from 'next/server'
import { storage } from '@/lib/storage'

export async function POST() {
  try {
    // Initialize the storage with sample data
    await storage.initialize()

    // Get the created data
    const cafeSettings = await storage.getCafeSettings()
    const tables = await storage.getTables()

    return NextResponse.json({
      message: 'Database initialized successfully',
      cafeSettings,
      tables,
    })
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    )
  }
}