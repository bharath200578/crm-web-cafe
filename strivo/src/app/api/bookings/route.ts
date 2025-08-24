import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/storage'

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
    let customer = await storage.getCustomerByEmail(customerEmail)

    if (!customer) {
      customer = await storage.createCustomer({
        name: customerName,
        email: customerEmail,
        phone: customerPhone || null,
      })
    }

    // Check if the selected table is available
    const selectedTable = await storage.getTableById(tableId)

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
    
    const allBookings = await storage.getBookings()
    const conflictingBooking = allBookings.find(booking => {
      if (booking.tableId !== tableId || !['PENDING', 'CONFIRMED'].includes(booking.status)) {
        return false
      }
      
      const bookingStart = new Date(booking.date)
      const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60 * 1000)
      
      // Check if the new booking overlaps with existing booking
      return (bookingDate < bookingEnd && bookingEndTime > bookingStart)
    })

    if (conflictingBooking) {
      return NextResponse.json(
        { error: 'Selected table is already booked for the requested time' },
        { status: 400 }
      )
    }

    // Create the booking
    const booking = await storage.createBooking({
      customerId: customer.id,
      tableId: selectedTable.id,
      date: bookingDate.toISOString(),
      duration: 120, // 2 hours
      partySize,
      status: 'PENDING',
      specialRequests: specialRequests || null,
    })

    return NextResponse.json({
      message: 'Booking created successfully',
      bookingId: booking.id,
      booking: {
        id: booking.id,
        date: booking.date,
        tableNumber: selectedTable.number,
        customerName: customer.name,
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
      const bookings = await storage.getBookingsByDateRange(startDate, endDate)
      
      // Add customer and table information
      const bookingsWithDetails = await Promise.all(
        bookings.map(async (booking) => {
          const customer = await storage.getCustomerById(booking.customerId)
          const table = await storage.getTableById(booking.tableId)
          return {
            ...booking,
            customer,
            table
          }
        })
      )

      return NextResponse.json({ 
        bookings: bookingsWithDetails.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      })
    }

    if (date) {
      // Get bookings for a specific date
      const startDate = new Date(date)
      const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000)

      const bookings = await storage.getBookingsByDateRange(startDate.toISOString(), endDate.toISOString())
      
      // Add customer and table information
      const bookingsWithDetails = await Promise.all(
        bookings.map(async (booking) => {
          const customer = await storage.getCustomerById(booking.customerId)
          const table = await storage.getTableById(booking.tableId)
          return {
            ...booking,
            customer,
            table
          }
        })
      )

      return NextResponse.json({ 
        bookings: bookingsWithDetails.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      })
    }

    if (email) {
      // Get bookings for a specific customer
      const customer = await storage.getCustomerByEmail(email)
      
      if (!customer) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        )
      }

      const bookings = await storage.getBookings()
      const customerBookings = bookings.filter(b => b.customerId === customer.id)
      
      // Add table information
      const bookingsWithTables = await Promise.all(
        customerBookings.map(async (booking) => {
          const table = await storage.getTableById(booking.tableId)
          return {
            ...booking,
            table,
            customer
          }
        })
      )

      return NextResponse.json({ 
        customer: {
          ...customer,
          bookings: bookingsWithTables.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        }
      })
    }

    // Get all bookings (for admin use)
    const bookings = await storage.getBookings()
    
    // Add customer and table information
    const bookingsWithDetails = await Promise.all(
      bookings.map(async (booking) => {
        const customer = await storage.getCustomerById(booking.customerId)
        const table = await storage.getTableById(booking.tableId)
        return {
          ...booking,
          customer,
          table
        }
      })
    )

    return NextResponse.json({ 
      bookings: bookingsWithDetails
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 50) // Limit to last 50 bookings
    })

  } catch (error) {
    console.error('Booking retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}