import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sign } from 'jsonwebtoken'

// Admin credentials (in production, these should be stored securely in environment variables)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Check credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Generate JWT token
      const token = sign(
        { 
          username: ADMIN_CREDENTIALS.username,
          role: 'admin',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        },
        JWT_SECRET
      )

      return NextResponse.json({
        message: 'Login successful',
        token,
        user: {
          username: ADMIN_CREDENTIALS.username,
          role: 'admin'
        }
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({
      message: 'Logout successful'
    })

    // Clear the cookie
    response.cookies.set('admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}