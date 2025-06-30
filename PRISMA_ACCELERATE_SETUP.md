# Prisma Accelerate Setup Guide

## What is Prisma Accelerate?

Prisma Accelerate is a managed connection pooling and global database cache that:
- ⚡ Reduces database load with connection pooling
- 🌍 Provides global edge caching for faster queries
- 🔒 Handles connection limits gracefully
- 📊 Offers built-in metrics and monitoring

## Your Accelerate Connection

```
prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiMDFKWVo5UEVRWERZSjFUMlg0MjJDNDE2Q00iLCJ0ZW5hbnRfaWQiOiJkODMzZmUzMjQ4NzhiYWY1MWQ4YzAxOGRiMjY4MjBiNDFjNDM3YTRlN2Y3NjM4OGY3ZGJhOWIzZmFiYWM2ZTNlIiwiaW50ZXJuYWxfc2VjcmV0IjoiMzdmNjcyZTMtZmQxZi00NTUyLThiMDUtN2U2MDg2NTVhOTJjIn0.109W_CcE8Nbf73ZrliWnfXnI93t0mS0xi37b_5gAdm0
```

## How to Use Prisma Accelerate

### 1. For Production (Recommended)

Update your production environment variables:

```env
# Production with Prisma Accelerate
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
```

### 2. Update Prisma Schema (Optional)

If you want to use Accelerate's caching features, you can add caching strategies to your schema:

```prisma
// In your schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}
```

### 3. Using Cache in Your Code

With Accelerate, you can add caching to queries:

```typescript
// Cache for 60 seconds
const events = await prisma.event.findMany({
  cacheStrategy: { ttl: 60 }
})

// Cache with staleness tolerance
const event = await prisma.event.findUnique({
  where: { id: eventId },
  cacheStrategy: { ttl: 300, swr: 60 }
})
```

## Environment Configuration

### Development vs Production

```env
# .env.local (Development)
DATABASE_URL="postgresql://buford@localhost:5432/family-dinner-dev"
POSTGRES_PRISMA_URL="postgresql://buford@localhost:5432/family-dinner-dev"
POSTGRES_URL_NON_POOLING="postgresql://buford@localhost:5432/family-dinner-dev"

# .env.production (Production with Accelerate)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
# Note: You still need the direct connection for migrations
POSTGRES_URL_NON_POOLING="postgres://your-actual-db-connection"
```

## Important Notes

1. **Accelerate is for Runtime Only**: You still need a direct database connection for:
   - Running migrations
   - Database introspection
   - Prisma Studio

2. **Keep Your Direct Connection**: Store both:
   - Accelerate URL (for app runtime)
   - Direct database URL (for migrations)

3. **API Key Security**: 
   - Never commit your API key to version control
   - Use environment variables
   - Rotate keys periodically

## Benefits for Your App

Using Accelerate with your Family Dinner app will:
- ✅ Handle traffic spikes during popular event launches
- ✅ Reduce database load when many users browse events
- ✅ Speed up recurring queries (like event lists)
- ✅ Prevent connection exhaustion issues

## Quick Setup for Production

1. Keep your current local setup for development
2. When deploying to production (Vercel, etc.), use:
   ```env
   DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_KEY"
   ```
3. Keep your Supabase connection for migrations:
   ```env
   POSTGRES_URL_NON_POOLING="postgres://...your-supabase-url..."
   ```

Your Accelerate connection is ready to use whenever you deploy to production! 🚀