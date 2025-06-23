// Authentication Signup API endpoint
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation
    const requiredFields = ['email', 'password', 'name', 'role']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: `Missing required fields: ${missingFields.join(', ')}`
        },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User already exists',
          message: 'An account with this email already exists'
        },
        { status: 409 }
      )
    }

    // Create new user
    // Note: In production, you'd hash the password with bcrypt
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        role: body.role,
        profile: body.bio || body.phone || body.venmoUsername ? {
          create: {
            bio: body.bio,
            phoneNumber: body.phone,
            venmoUsername: body.venmoUsername
          }
        } : undefined
      },
      include: { profile: true }
    })

    // Return user data (in production, you'd use JWT tokens)
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
      message: 'Account created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Signup error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Signup failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}