// Authentication Login API endpoint
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // For demo purposes, we'll support the demo chef account
    if (body.email === 'chef@example.com' && body.password === 'password') {
      // Check if demo chef exists in database, create if not
      let user = await prisma.user.findUnique({
        where: { email: 'chef@example.com' },
        include: { profile: true }
      })

      if (!user) {
        // Create demo chef user
        user = await prisma.user.create({
          data: {
            email: 'chef@example.com',
            name: 'Sarah Johnson',
            role: 'CHEF',
            profile: {
              create: {
                bio: 'Passionate home chef specializing in comfort food and international cuisine.',
                phoneNumber: '+1 (555) 123-4567',
                venmoUsername: 'sarah-chef',
                avatarUrl: '/api/placeholder/48/48'
              }
            }
          },
          include: { profile: true }
        })
      }

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
        message: 'Login successful'
      })
    }

    // For other accounts, we'd normally check hashed passwords
    // For now, return invalid credentials
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication failed',
        message: 'Invalid email or password'
      },
      { status: 401 }
    )

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