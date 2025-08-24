import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const customers = await db.customer.findMany({
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
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({ customers })
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
    const existingCustomer = await db.customer.findUnique({
      where: { email }
    })

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this email already exists' },
        { status: 400 }
      )
    }

    const customer = await db.customer.create({
      data: {
        name,
        email,
        phone: phone || null,
      },
      include: {
        bookings: {
          include: {
            table: true,
          },
        },
      },
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