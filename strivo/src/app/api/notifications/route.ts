import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { bookingId, type } = await request.json()

    if (!bookingId || !type) {
      return NextResponse.json(
        { error: 'Booking ID and notification type are required' },
        { status: 400 }
      )
    }

    // Get booking details
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
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

    let notificationContent = ''
    let notificationType = ''

    switch (type) {
      case 'confirmation':
        notificationType = 'Booking Confirmation'
        notificationContent = `
          Dear ${booking.customer.name},
          
          Your table reservation at Cafe Delight has been confirmed!
          
          Booking Details:
          - Date: ${new Date(booking.date).toLocaleDateString()}
          - Time: ${new Date(booking.date).toLocaleTimeString()}
          - Table: ${booking.table.number}
          - Party Size: ${booking.partySize}
          - Booking Reference: ${booking.id}
          
          We look forward to serving you!
          
          Best regards,
          Cafe Delight Team
        `
        break

      case 'reminder':
        notificationType = 'Booking Reminder'
        notificationContent = `
          Dear ${booking.customer.name},
          
          This is a friendly reminder about your upcoming reservation at Cafe Delight.
          
          Booking Details:
          - Date: ${new Date(booking.date).toLocaleDateString()}
          - Time: ${new Date(booking.date).toLocaleTimeString()}
          - Table: ${booking.table.number}
          - Party Size: ${booking.partySize}
          
          Please arrive on time. If you need to cancel or modify your reservation, please contact us.
          
          Best regards,
          Cafe Delight Team
        `
        break

      case 'cancellation':
        notificationType = 'Booking Cancellation'
        notificationContent = `
          Dear ${booking.customer.name},
          
          Your booking at Cafe Delight has been cancelled as requested.
          
          Cancelled Booking Details:
          - Date: ${new Date(booking.date).toLocaleDateString()}
          - Time: ${new Date(booking.date).toLocaleTimeString()}
          - Table: ${booking.table.number}
          - Party Size: ${booking.partySize}
          - Booking Reference: ${booking.id}
          
          We hope to see you again soon!
          
          Best regards,
          Cafe Delight Team
        `
        break

      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        )
    }

    // In a real application, you would send an email here
    // For demo purposes, we'll just log the notification
    console.log(`Sending ${notificationType} to ${booking.customer.email}:`)
    console.log(notificationContent)

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      message: `${notificationType} sent successfully`,
      notification: {
        type: notificationType,
        recipient: booking.customer.email,
        content: notificationContent,
        sentAt: new Date().toISOString(),
      }
    })

  } catch (error) {
    console.error('Notification sending error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}