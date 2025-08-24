import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/storage'

export async function GET(request: NextRequest) {
  try {
    const customers = await storage.getCustomers()
    
    // Get bookings for each customer
    const customersWithBookings = await Promise.all(
      customers.map(async (customer) => {
        const bookings = await storage.getBookings()
        const customerBookings = bookings.filter(b => b.customerId === customer.id)
        
        // Get table information for each booking
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
        
        return {
          ...customer,
          bookings: bookingsWithTables.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        }
      })
    )

    return NextResponse.json({ 
      customers: customersWithBookings.sort((a, b) => a.name.localeCompare(b.name))
    })
  } catch (error) {
    console.error('Customer retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if customer already exists
    const existingCustomer = await storage.getCustomerByEmail(email)

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this email already exists' },
        { status: 400 }
      )
    }

    const customer = await storage.createCustomer({
      name,
      email,
      phone: phone || null,
    })

    return NextResponse.json({
      message: 'Customer created successfully',
      customer,
    })
  } catch (error) {
    console.error('Customer creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}