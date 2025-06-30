// User Service for managing user creation and synchronization with Clerk
import { prisma } from '@/lib/prisma'
import { clerkClient } from '@clerk/nextjs/server'

export class UserService {
  // Ensure user exists in database, creating if necessary
  static async ensureUserExists(clerkUserId: string) {
    try {
      // Check if user already exists in database
      const existingUser = await prisma.user.findUnique({
        where: { id: clerkUserId }
      })
      
      if (existingUser) {
        return existingUser
      }
      
      // Get user data from Clerk
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(clerkUserId)
      
      // Extract user information from Clerk
      const primaryEmail = clerkUser.emailAddresses.find(
        email => email.id === clerkUser.primaryEmailAddressId
      )?.emailAddress
      
      const userName = clerkUser.fullName || 
                      clerkUser.firstName || 
                      clerkUser.username || 
                      'User'
                      
      if (!primaryEmail) {
        throw new Error('User must have a primary email address')
      }
      
      // Create user in database
      const newUser = await prisma.user.create({
        data: {
          id: clerkUserId,
          email: primaryEmail,
          name: userName,
          role: 'ATTENDEE' // Default role for new users
        }
      })
      
      return newUser
      
    } catch (error) {
      console.error('Error ensuring user exists:', error)
      throw new Error('Failed to create or retrieve user')
    }
  }
  
  // Update user information from Clerk data
  static async syncUserWithClerk(clerkUserId: string) {
    try {
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(clerkUserId)
      
      const primaryEmail = clerkUser.emailAddresses.find(
        email => email.id === clerkUser.primaryEmailAddressId
      )?.emailAddress
      
      const userName = clerkUser.fullName || 
                      clerkUser.firstName || 
                      clerkUser.username || 
                      'User'
      
      if (!primaryEmail) {
        throw new Error('User must have a primary email address')
      }
      
      // Upsert user with latest Clerk data
      const user = await prisma.user.upsert({
        where: { id: clerkUserId },
        update: {
          email: primaryEmail,
          name: userName
        },
        create: {
          id: clerkUserId,
          email: primaryEmail,
          name: userName,
          role: 'ATTENDEE'
        }
      })
      
      return user
      
    } catch (error) {
      console.error('Error syncing user with Clerk:', error)
      throw new Error('Failed to sync user data')
    }
  }
}