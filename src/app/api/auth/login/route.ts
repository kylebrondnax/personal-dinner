// Authentication Login API endpoint
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation
    if (!body.email || !body.password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: 'Email and password are required'
        },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: body.email },
      include: { profile: true }
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication failed',
          message: 'Invalid email or password'
        },
        { status: 401 }
      )
    }

    // Special case for demo chef account that might not have a password yet
    if (body.email === 'chef@example.com' && body.password === 'password' && !user.password) {
      // Update the demo user with a hashed password
      const hashedPassword = await bcrypt.hash('password', 12)
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      })
      
      // Return user data
      return NextResponse.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profile: user.profile ? {
            avatarUrl: user.profile.avatarUrl,
            bio: user.profile.bio,
            phone: user.profile.phoneNumber,
            venmoUsername: user.profile.venmoUsername
          } : undefined
        },
        message: 'Login successful'
      })
    }

    // Verify password for all other users
    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication failed',
          message: 'Account needs password reset'
        },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(body.password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication failed',
          message: 'Invalid email or password'
        },
        { status: 401 }
      )
    }

    // Return user data
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: user.profile ? {
          avatarUrl: user.profile.avatarUrl,
          bio: user.profile.bio,
          phone: user.profile.phoneNumber,
          venmoUsername: user.profile.venmoUsername
        } : undefined
      },
      message: 'Login successful'
    })

  } catch (error) {
    console.error('Login error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Login failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}