import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await db.booking.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        table: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ booking })
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
    const { status, specialRequests, partySize, date } = body

    const existingBooking = await db.booking.findUnique({
      where: { id: params.id },
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (specialRequests !== undefined) updateData.specialRequests = specialRequests
    if (partySize) updateData.partySize = partySize
    if (date) updateData.date = new Date(date)

    const updatedBooking = await db.booking.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: true,
        table: true,
      },
    })

    return NextResponse.json({
      message: 'Booking updated successfully',
      booking: updatedBooking,
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
    const existingBooking = await db.booking.findUnique({
      where: { id: params.id },
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    await db.booking.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Booking deleted successfully',
    })
  } catch (error) {
    console.error('Booking deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}