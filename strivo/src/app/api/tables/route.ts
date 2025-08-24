import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const tables = await db.table.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        number: 'asc'
      }
    })

    return NextResponse.json({
      tables,
      total: tables.length
    })
  } catch (error) {
    console.error('Error fetching tables:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    )
  }
}