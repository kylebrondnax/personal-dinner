# Production Deployment Guide for familydinner.me

This guide covers deploying the Family Dinner application to production using the domain `familydinner.me`.

## 🚀 **Deployment Steps**

### **1. Choose Hosting Platform**

#### **Option A: Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel

# Follow prompts to connect to your account
# Set project name: family-dinner
# Set domain: familydinner.me
```

#### **Option B: Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### **2. Environment Variables Setup**

Create production environment variables in your hosting platform:

#### **Database (Supabase)**
```env
POSTGRES_URL="postgres://postgres.dmwzofyeaywopjbfxzuh:fKSY4DuZ5f8cfSl5@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"
POSTGRES_PRISMA_URL="postgres://postgres.dmwzofyeaywopjbfxzuh:fKSY4DuZ5f8cfSl5@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"
POSTGRES_URL_NON_POOLING="postgres://postgres.dmwzofyeaywopjbfxzuh:fKSY4DuZ5f8cfSl5@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
NEXT_PUBLIC_SUPABASE_URL="https://dmwzofyeaywopjbfxzuh.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtd3pvZnllYXl3b3BqYmZ4enVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODkzMjcsImV4cCI6MjA2NjI2NTMyN30.FGsGh2P_zF7yOHll-2-mkPyoCQMyxEIpreW3mMZyN_0"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtd3pvZnllYXl3b3BqYmZ4enVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4OTMyNywiZXhwIjoyMDY2MjY1MzI3fQ.uRt5DzPCPSXaMSq_Pe_ejCzpPovzhbfxnF2Umvm5gUs"
```

#### **Clerk Authentication (Production Keys Needed)**
```env
# TODO: Get production keys from Clerk dashboard
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_[YOUR_PRODUCTION_KEY]
CLERK_SECRET_KEY=sk_live_[YOUR_PRODUCTION_SECRET]
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

#### **Email Service (Choose One)**
```env
# Option A: Resend (Recommended)
RESEND_API_KEY=re_[YOUR_RESEND_KEY]
FROM_EMAIL=noreply@familydinner.me

# Option B: SendGrid
SENDGRID_API_KEY=SG.[YOUR_SENDGRID_KEY]
FROM_EMAIL=noreply@familydinner.me

# Option C: SMTP (Your iCloud+ email)
SMTP_HOST=smtp.mail.me.com
SMTP_PORT=587
SMTP_USER=your-email@familydinner.me
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@familydinner.me
```

#### **Application Settings**
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://familydinner.me
DATABASE_URL=$POSTGRES_URL
```

### **3. DNS Configuration**

#### **Domain Settings**
1. Point `familydinner.me` to your hosting provider:
   - **Vercel**: Add CNAME record pointing to `cname.vercel-dns.com`
   - **Railway**: Add CNAME record from Railway dashboard
   - **Custom**: Point A record to your server IP

#### **Email DNS Records**
Add these records to your DNS provider:

```dns
# SPF Record
TXT @ "v=spf1 include:icloud.com include:_spf.resend.com ~all"

# DKIM Record (get from your email provider)
TXT default._domainkey [DKIM_KEY_FROM_PROVIDER]

# DMARC Record
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:dmarc@familydinner.me"

# MX Records (for receiving email)
MX @ mx01.mail.icloud.com 10
MX @ mx02.mail.icloud.com 20
```

### **4. Clerk Production Setup**

#### **Create Production App**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create new application for production
3. Configure domains:
   - Add `familydinner.me`
   - Add `www.familydinner.me`
4. Update environment variables with production keys

#### **Configure Redirects**
```javascript
// In Clerk dashboard, set:
// Sign-in URL: https://familydinner.me/sign-in
// Sign-up URL: https://familydinner.me/sign-up
// After sign-in: https://familydinner.me/
// After sign-up: https://familydinner.me/
```

### **5. Database Migration**

#### **Run Prisma Migration**
```bash
# Generate Prisma client for production
npx prisma generate

# Push database schema to production
npx prisma db push

# Optional: Seed with sample data
npx prisma db seed
```

### **6. Email Service Setup**

#### **Option A: Resend Setup**
1. Sign up at [resend.com](https://resend.com)
2. Verify domain `familydinner.me`
3. Get API key and add to environment variables
4. Install Resend package:
```bash
npm install resend
```

#### **Option B: iCloud+ SMTP Setup**
1. Enable two-factor authentication on your Apple ID
2. Generate app-specific password
3. Use SMTP settings above
4. Install nodemailer:
```bash
npm install nodemailer
```

## 🧪 **Testing Production Deployment**

### **Pre-deployment Checklist**
- [ ] All environment variables configured
- [ ] Database connection working
- [ ] Clerk authentication configured
- [ ] Email service configured
- [ ] DNS records propagated
- [ ] SSL certificate active

### **Post-deployment Testing**
- [ ] Homepage loads correctly
- [ ] User registration/login works
- [ ] Event creation works
- [ ] Email notifications sent
- [ ] Mobile responsiveness
- [ ] Dark mode toggle

### **Monitoring & Performance**
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics (Plausible/Google Analytics)
- [ ] Monitor Core Web Vitals
- [ ] Set up uptime monitoring

## 🔧 **Additional Production Configuration**

### **Security Headers**
Add to `next.config.js`:
```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}
```

### **Performance Optimization**
```javascript
// Add to next.config.js
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  },
  images: {
    domains: ['familydinner.me'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
}
```

### **Analytics & Monitoring**
```bash
# Add error tracking
npm install @sentry/nextjs

# Add analytics
npm install @plasmohq/analytics
```

## 📝 **Post-Launch Tasks**

### **Content**
- [ ] Add privacy policy
- [ ] Add terms of service
- [ ] Create help/FAQ section
- [ ] Add contact information

### **SEO**
- [ ] Configure meta tags
- [ ] Add sitemap.xml
- [ ] Add robots.txt
- [ ] Set up Google Search Console

### **Marketing**
- [ ] Set up social media accounts
- [ ] Create launch announcement
- [ ] Prepare press kit
- [ ] Plan user onboarding flow

## 🚨 **Troubleshooting**

### **Common Issues**
1. **Database connection fails**: Check connection string and network access
2. **Clerk authentication errors**: Verify domain configuration and keys
3. **Email delivery issues**: Check SPF/DKIM records and API keys
4. **Build failures**: Check TypeScript errors and missing dependencies

### **Useful Commands**
```bash
# Check deployment logs
vercel logs [deployment-url]

# Test database connection
npx prisma studio

# Check environment variables
vercel env ls

# Force redeploy
vercel --force
```

## 📞 **Support Resources**
- Vercel Documentation: https://vercel.com/docs
- Clerk Documentation: https://clerk.com/docs
- Supabase Documentation: https://supabase.com/docs
- Next.js Documentation: https://nextjs.org/docs