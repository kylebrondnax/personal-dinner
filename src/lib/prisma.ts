// Database connection singleton (like Laravel's DB facade)
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Configure for Supabase connection pooling to avoid prepared statement conflicts
  datasources: {
    db: {
      url: process.env.POSTGRES_PRISMA_URL + '&pgbouncer=true&prepared_statements=false'
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma