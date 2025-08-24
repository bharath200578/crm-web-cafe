import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/storage'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await storage.getBookingById(params.id)

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Add customer and table information
    const customer = await storage.getCustomerById(booking.customerId)
    const table = await storage.getTableById(booking.tableId)

    return NextResponse.json({ 
      booking: {
        ...booking,
        customer,
        table
      }
    })
  } catch (error) {
    console.error('Booking retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, specialRequests } = body

    const booking = await storage.getBookingById(params.id)

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    const updatedBooking = await storage.updateBooking(params.id, {
      status: status || booking.status,
      specialRequests: specialRequests !== undefined ? specialRequests : booking.specialRequests,
    })

    if (!updatedBooking) {
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      )
    }

    // Add customer and table information
    const customer = await storage.getCustomerById(updatedBooking.customerId)
    const table = await storage.getTableById(updatedBooking.tableId)

    return NextResponse.json({
      message: 'Booking updated successfully',
      booking: {
        ...updatedBooking,
        customer,
        table
      }
    })
  } catch (error) {
    console.error('Booking update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await storage.getBookingById(params.id)

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    const deleted = await storage.deleteBooking(params.id)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete booking' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Booking deleted successfully'
    })
  } catch (error) {
    console.error('Booking deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}