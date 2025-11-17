# SplitShare Setup Guide

This guide will help you set up the SplitShare application with all Phase 1 must-have configurations.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Supabase account)
- Git

## 1. Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Then configure each variable:

### Database

```env
DATABASE_URL=postgresql://user:password@localhost:5432/splitshare
```

**Supabase users**: Get this from your Supabase project settings > Database > Connection string (Direct connection)

### Supabase

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
```

Get these from: Supabase Dashboard > Project Settings > API

### Better Auth

```env
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:5173
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:5173
```

Generate a secure secret:

```bash
openssl rand -base64 32
```

For production, update `BETTER_AUTH_URL` to your production domain.

### Email Service (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Verify your sending domain (or use their test domain)

```env
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=noreply@yourdomain.com
```

For development, you can use: `onboarding@resend.dev`

### Error Monitoring (Sentry)

1. Create a free account at [sentry.io](https://sentry.io)
2. Create a new SvelteKit project
3. Get your DSN and auth token

```env
SENTRY_DSN=https://your-key@sentry.io/project-id
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name
```

**Optional for development**: Leave empty to disable Sentry in development.

### Rate Limiting (Upstash Redis)

1. Create a free account at [upstash.com](https://upstash.com)
2. Create a Redis database (select "Global" for best performance)
3. Copy the REST API credentials

```env
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### Application

```env
PUBLIC_APP_URL=http://localhost:5173
NODE_ENV=development
```

For production, update `PUBLIC_APP_URL` to your production domain.

## 2. Database Setup

### Install Drizzle CLI

```bash
npm install -g drizzle-kit
```

### Run Migrations

Generate migration files:

```bash
npm run db:generate
```

Push schema to database:

```bash
npm run db:push
```

View database in Drizzle Studio:

```bash
npm run db:studio
```

### Supabase Storage Setup

If using Supabase, create these storage buckets:

1. Go to Storage in your Supabase dashboard
2. Create the following buckets:
   - `avatars` (public)
   - `split-images` (public)
   - `exercise-images` (public)
   - `exercise-videos` (public)

Configure CORS and file size limits as needed.

## 3. Install Dependencies

```bash
npm install
```

This will install all dependencies including:

- Resend (email)
- @upstash/ratelimit (rate limiting)
- @sentry/sveltekit (error monitoring)

## 4. Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Type Checking

Run type checks:

```bash
npm run check
```

Watch mode:

```bash
npm run check:watch
```

### Linting & Formatting

```bash
npm run lint    # Check for issues
npm run format  # Fix formatting
```

## 5. Testing

Run unit tests:

```bash
npm test
```

Run integration tests (Playwright):

```bash
npm run test:integration
```

## 6. Mobile Setup (Capacitor)

### iOS Setup

1. Install Xcode from the App Store
2. Install CocoaPods:
   ```bash
   sudo gem install cocoapods
   ```
3. Sync and open iOS project:
   ```bash
   npm run cap:ios
   ```

### Android Setup

1. Install [Android Studio](https://developer.android.com/studio)
2. Install Android SDK and tools
3. Sync and open Android project:
   ```bash
   npm run cap:android
   ```

### Mobile Development Workflow

1. Make changes to your code
2. Sync with Capacitor:
   ```bash
   npm run cap:sync
   ```
3. Run on device/emulator from Xcode/Android Studio

## 7. Production Deployment

### Build for Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### Environment Variables

Ensure all production environment variables are set:

- Update `BETTER_AUTH_URL` to production domain
- Update `PUBLIC_APP_URL` to production domain
- Use production database credentials
- Set `NODE_ENV=production`

### Sentry Source Maps

Source maps are automatically uploaded to Sentry during build if you have configured:

- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`

## 8. Feature-Specific Setup

### Rate Limiting

Rate limits are configured in `src/lib/server/rate-limit.ts`:

- **Auth endpoints**: 5 requests per 15 minutes
- **API endpoints**: 100 requests per minute
- **File uploads**: 10 uploads per hour
- **Public feed**: 200 requests per minute

Adjust these limits based on your needs.

### Email Templates

Email templates are in `src/lib/server/email.ts`:

- Verification email
- Password reset email
- Welcome email

Customize these templates to match your branding.

### Media Optimization

Images and videos are automatically optimized using Supabase Image Transformation.

Utilities in `src/lib/utils/media.ts`:

- `getOptimizedImageUrl()` - Generate optimized image URLs
- `getThumbnailUrl()` - Get image thumbnails
- `getVideoThumbnail()` - Get video thumbnails
- `getVideoMetadata()` - Extract video metadata

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Ensure database is running
- Check firewall settings

### Email Not Sending

- Verify Resend API key
- Check domain verification
- Review Resend dashboard for errors

### Rate Limiting Not Working

- Verify Upstash Redis credentials
- Check Redis instance is active
- Review Upstash dashboard

### Sentry Not Capturing Errors

- Verify `SENTRY_DSN` is set
- Check Sentry project settings
- Ensure environment is correct

## Next Steps

After completing Phase 1 setup, you can:

1. Implement API endpoints for CRUD operations
2. Add search and filtering functionality
3. Implement real-time features with Supabase Realtime
4. Add analytics with PostHog
5. Set up background jobs for email processing
6. Configure CDN for static assets

## Resources

- [SvelteKit Documentation](https://kit.svelte.dev)
- [Better Auth Documentation](https://www.better-auth.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Capacitor Documentation](https://capacitorjs.com)
- [Resend Documentation](https://resend.com/docs)
- [Upstash Documentation](https://docs.upstash.com)
- [Sentry Documentation](https://docs.sentry.io)
