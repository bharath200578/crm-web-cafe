import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerName,
      customerEmail,
      customerPhone,
      date,
      partySize,
      tableId,
      specialRequests,
    } = body

    // Validate required fields
    if (!customerName || !customerEmail || !date || !partySize || !tableId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Parse the booking date
    const bookingDate = new Date(date)
    
    // Find or create customer
    let customer = await db.customer.findUnique({
      where: { email: customerEmail }
    })

    if (!customer) {
      customer = await db.customer.create({
        data: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone || null,
        }
      })
    }

    // Check if the selected table is available
    const selectedTable = await db.table.findUnique({
      where: { id: tableId }
    })

    if (!selectedTable || !selectedTable.isActive) {
      return NextResponse.json(
        { error: 'Selected table is not available' },
        { status: 400 }
      )
    }

    if (selectedTable.capacity < partySize) {
      return NextResponse.json(
        { error: 'Selected table cannot accommodate the party size' },
        { status: 400 }
      )
    }

    // Check for conflicting bookings for the selected table
    const bookingEndTime = new Date(bookingDate.getTime() + 2 * 60 * 60 * 1000) // 2 hours default duration
    
    const conflictingBooking = await db.booking.findFirst({
      where: {
        tableId: tableId,
        status: {
          in: ['PENDING', 'CONFIRMED']
        },
        OR: [
          {
            AND: [
              { date: { lte: bookingDate } },
              { 
                date: { 
                  gte: new Date(bookingDate.getTime() - 2 * 60 * 60 * 1000) 
                } 
              }
            ]
          },
          {
            AND: [
              { date: { lte: bookingEndTime } },
              { 
                date: { 
                  gte: bookingDate 
                } 
              }
            ]
          }
        ]
      }
    })

    if (conflictingBooking) {
      return NextResponse.json(
        { error: 'Selected table is already booked for the requested time' },
        { status: 400 }
      )
    }

    // Create the booking
    const booking = await db.booking.create({
      data: {
        customerId: customer.id,
        tableId: selectedTable.id,
        date: bookingDate,
        duration: 120, // 2 hours
        partySize,
        status: 'PENDING',
        specialRequests: specialRequests || null,
      },
      include: {
        customer: true,
        table: true,
      }
    })

    return NextResponse.json({
      message: 'Booking created successfully',
      bookingId: booking.id,
      booking: {
        id: booking.id,
        date: booking.date,
        tableNumber: booking.table.number,
        customerName: booking.customer.name,
        status: booking.status,
      }
    })

  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const email = searchParams.get('email')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (startDate && endDate) {
      // Get bookings for a date range (used by table selection)
      const bookings = await db.booking.findMany({
        where: {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        include: {
          customer: true,
          table: true,
        },
        orderBy: {
          date: 'asc',
        },
      })

      return NextResponse.json({ bookings })
    }

    if (date) {
      // Get bookings for a specific date
      const startDate = new Date(date)
      const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000)

      const bookings = await db.booking.findMany({
        where: {
          date: {
            gte: startDate,
            lt: endDate,
          },
        },
        include: {
          customer: true,
          table: true,
        },
        orderBy: {
          date: 'asc',
        },
      })

      return NextResponse.json({ bookings })
    }

    if (email) {
      // Get bookings for a specific customer
      const customer = await db.customer.findUnique({
        where: { email },
        include: {
          bookings: {
            include: {
              table: true,
            },
            orderBy: {
              date: 'desc',
            },
          },
        },
      })

      if (!customer) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ customer })
    }

    // Get all bookings (for admin use)
    const bookings = await db.booking.findMany({
      include: {
        customer: true,
        table: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: 50, // Limit to last 50 bookings
    })

    return NextResponse.json({ bookings })

  } catch (error) {
    console.error('Booking retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}