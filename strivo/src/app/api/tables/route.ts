import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/storage'

export async function GET(request: NextRequest) {
  try {
    const tables = await storage.getTables()
    const activeTables = tables.filter(table => table.isActive)
    
    return NextResponse.json({
      tables: activeTables.sort((a, b) => a.number - b.number),
      total: activeTables.length
    })
  } catch (error) {
    console.error('Error fetching tables:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    )
  }
}