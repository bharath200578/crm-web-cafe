import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Create cafe settings
    const cafeSettings = await db.cafeSettings.create({
      data: {
        name: 'Cafe Delight',
        description: 'Fine dining experience with locally-sourced ingredients',
        address: '123 Main Street, Downtown',
        phone: '(555) 123-4567',
        email: 'info@cafedelight.com',
        openingHours: JSON.stringify({
          monday: { open: '09:00', close: '22:00' },
          tuesday: { open: '09:00', close: '22:00' },
          wednesday: { open: '09:00', close: '22:00' },
          thursday: { open: '09:00', close: '22:00' },
          friday: { open: '09:00', close: '23:00' },
          saturday: { open: '09:00', close: '23:00' },
          sunday: { open: '09:00', close: '21:00' },
        }),
        maxPartySize: 10,
        minPartySize: 1,
        bookingDuration: 120,
        timeSlots: JSON.stringify([
          '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
          '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
          '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
          '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
          '21:00', '21:30'
        ]),
      },
    })

    // Create tables
    const tables = await Promise.all([
      db.table.create({
        data: {
          number: 1,
          capacity: 2,
          location: 'Window',
          description: 'Cozy table by the window with natural light',
        },
      }),
      db.table.create({
        data: {
          number: 2,
          capacity: 2,
          location: 'Window',
          description: 'Intimate window seating for two',
        },
      }),
      db.table.create({
        data: {
          number: 3,
          capacity: 4,
          location: 'Center',
          description: 'Spacious table in the main dining area',
        },
      }),
      db.table.create({
        data: {
          number: 4,
          capacity: 4,
          location: 'Center',
          description: 'Comfortable seating for small groups',
        },
      }),
      db.table.create({
        data: {
          number: 5,
          capacity: 6,
          location: 'Corner',
          description: 'Large corner table perfect for groups',
        },
      }),
      db.table.create({
        data: {
          number: 6,
          capacity: 8,
          location: 'Private',
          description: 'Semi-private dining area for larger parties',
        },
      }),
      db.table.create({
        data: {
          number: 7,
          capacity: 2,
          location: 'Patio',
          description: 'Outdoor seating with garden view',
        },
      }),
      db.table.create({
        data: {
          number: 8,
          capacity: 4,
          location: 'Patio',
          description: 'Spacious outdoor dining table',
        },
      }),
    ])

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