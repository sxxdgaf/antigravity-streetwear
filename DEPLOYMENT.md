# 🚀 ANTIGRAVITY Deployment Guide

This guide covers deploying the ANTIGRAVITY e-commerce platform to production.

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Supabase account with project set up
- Stripe account with API keys
- Vercel account (for Vercel deployment) or Docker (for containerized deployment)
- Optional: Sentry account for error monitoring

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

### Required Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Site URL
NEXT_PUBLIC_SITE_URL=https://antigravity.pk
```

### Optional Variables

```bash
# Sentry (Error Monitoring)
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-org
SENTRY_PROJECT=antigravity

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Email
RESEND_API_KEY=re_...
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and link project
   vercel login
   vercel link
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard > Project Settings > Environment Variables
   - Add all required environment variables

3. **Deploy**
   ```bash
   # Preview deployment
   vercel
   
   # Production deployment
   vercel --prod
   ```

4. **Set up Custom Domain**
   - Go to Vercel Dashboard > Project Settings > Domains
   - Add `antigravity.pk` and configure DNS

### Option 2: Docker

1. **Build Image**
   ```bash
   docker build \
     --build-arg NEXT_PUBLIC_SUPABASE_URL=your-url \
     --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
     --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-key \
     --build-arg NEXT_PUBLIC_SITE_URL=https://antigravity.pk \
     -t antigravity-app .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 \
     -e SUPABASE_SERVICE_ROLE_KEY=your-key \
     -e STRIPE_SECRET_KEY=your-key \
     -e STRIPE_WEBHOOK_SECRET=your-secret \
     antigravity-app
   ```

3. **Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Option 3: Self-Hosted (VPS)

1. **Server Setup**
   ```bash
   # Install Node.js 20
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   npm install -g pm2
   ```

2. **Clone and Build**
   ```bash
   git clone https://github.com/your-org/antigravity.git
   cd antigravity
   npm ci
   npm run build
   ```

3. **Start with PM2**
   ```bash
   pm2 start npm --name "antigravity" -- start
   pm2 save
   pm2 startup
   ```

4. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name antigravity.pk www.antigravity.pk;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **SSL with Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d antigravity.pk -d www.antigravity.pk
   ```

## Post-Deployment Setup

### 1. Stripe Webhook

Set up webhook endpoint in Stripe Dashboard:
- Endpoint URL: `https://antigravity.pk/api/webhooks/stripe`
- Events to listen:
  - `checkout.session.completed`
  - `checkout.session.expired`
  - `payment_intent.payment_failed`

### 2. Supabase Configuration

1. **Row Level Security (RLS)**
   - Ensure all RLS policies are enabled
   - Test policies work correctly

2. **Storage Buckets**
   - Create `products` bucket for product images
   - Configure public access policies

3. **Edge Functions (if used)**
   - Deploy any Supabase Edge Functions

### 3. Database Seeding

```bash
# Run database seed (creates initial data)
npm run db:seed
```

## Monitoring

### Health Check

The application exposes a health endpoint:
```
GET /api/health
```

### Sentry

If configured, errors are automatically captured and sent to Sentry.

Dashboard: https://sentry.io/organizations/your-org/issues/

### Logging

Application logs are available via:
- Vercel: Dashboard > Project > Logs
- Docker: `docker logs antigravity-app`
- PM2: `pm2 logs antigravity`

## CI/CD Pipeline

GitHub Actions automatically:
1. Runs linting and type checking
2. Runs unit tests
3. Runs E2E tests
4. Builds the application
5. Deploys preview for PRs
6. Deploys to production on `main` branch merge

### Required GitHub Secrets

Add these secrets in GitHub Repository Settings:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `CODECOV_TOKEN` (optional)
- `SNYK_TOKEN` (optional)

## Troubleshooting

### Build Failures

1. Check environment variables are set
2. Clear `.next` cache: `rm -rf .next`
3. Reinstall dependencies: `rm -rf node_modules && npm ci`

### Database Connection Issues

1. Check Supabase project is active
2. Verify connection string in environment
3. Check RLS policies aren't blocking queries

### Stripe Issues

1. Verify API keys match environment (test vs live)
2. Check webhook secret is correct
3. Test webhook endpoint with Stripe CLI

### Performance Issues

1. Check Vercel Analytics for bottlenecks
2. Review Sentry for slow transactions
3. Enable caching where appropriate

## Rollback

### Vercel

```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote [deployment-url]
```

### Docker

```bash
# List images
docker images antigravity-app

# Run previous version
docker run -p 3000:3000 antigravity-app:previous-tag
```

## Security Checklist

- [ ] All environment variables are set correctly
- [ ] Stripe is using live keys in production
- [ ] Supabase RLS policies are enabled
- [ ] HTTPS is configured
- [ ] Security headers are present
- [ ] Admin routes are protected
- [ ] Rate limiting is enabled
- [ ] Sentry is capturing errors
- [ ] Regular backups are configured

## Support

For deployment issues:
- Check documentation
- Review GitHub Issues
- Contact: tech@antigravity.pk
