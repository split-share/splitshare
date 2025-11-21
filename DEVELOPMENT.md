# Local Development Guide

This guide will help you get SplitShare running locally in under 5 minutes.

## Quick Start

### 1. Prerequisites

- **Node.js 18+** and npm
- **Docker** and Docker Compose
- **Git**

### 2. Clone and Install

```bash
# Clone the repository
git clone git@github.com:rezk2ll/splitshare.git
cd splitshare

# Install dependencies
npm install
```

### 3. Start Infrastructure Services

```bash
# Start PostgreSQL, Redis, and Mailpit
docker-compose up -d

# Verify services are running
docker-compose ps
```

You should see:

- ✅ `splitshare-postgres` - Database (port 5432)
- ✅ `splitshare-redis` - Rate limiting (port 6379)
- ✅ `splitshare-mailpit` - Email testing (ports 1025, 8025)

### 4. Configure Environment

```bash
# Copy local development environment
cp .env.local.example .env

# The default values work out of the box - no changes needed!
```

### 5. Set Up Database

```bash
# Push database schema
npm run db:push

# (Optional) Open Drizzle Studio to view database
npm run db:studio
```

### 6. Start Development Server

```bash
npm run dev
```

🎉 **Done!** Open http://localhost:5173

## Development Workflow

### Daily Development

```bash
# Start services if not running
docker-compose up -d

# Start dev server
npm run dev

# In another terminal, watch types
npm run check:watch
```

### Stopping Services

```bash
# Stop all Docker services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

## Available Services

### Application

- **App**: http://localhost:5173
- Hot reload enabled
- TypeScript type checking

### Development Tools

#### Mailpit (Email Testing)

- **Web UI**: http://localhost:8025
- **SMTP**: localhost:1025
- View all emails sent by the app
- No configuration needed

#### Drizzle Studio (Database GUI)

```bash
npm run db:studio
```

- **URL**: http://localhost:4983
- Browse and edit database
- View relationships

#### pgAdmin (Optional)

```bash
# Start pgAdmin with other services
docker-compose --profile tools up -d
```

- **URL**: http://localhost:5050
- **Email**: admin@splitshare.local
- **Password**: admin

Add server in pgAdmin:

- **Host**: postgres
- **Port**: 5432
- **Database**: splitshare
- **Username**: splitshare
- **Password**: splitshare_dev_password

## Common Tasks

### Database Operations

```bash
# Generate new migration
npm run db:generate

# Push schema changes to database
npm run db:push

# Open database studio
npm run db:studio
```

### Code Quality

```bash
# Type check
npm run check

# Lint code
npm run lint

# Format code
npm run format

# Run tests
npm test
```

### Database Reset

```bash
# Stop containers and delete data
docker-compose down -v

# Start fresh
docker-compose up -d

# Re-push schema
npm run db:push
```

## Project Structure

```
splitshare/
├── src/
│   ├── lib/
│   │   ├── components/      # Svelte components
│   │   ├── schemas/         # Zod validation schemas
│   │   ├── server/
│   │   │   ├── auth/        # Authentication
│   │   │   ├── db/          # Database & schema
│   │   │   ├── email.ts     # Email templates
│   │   │   └── rate-limit.ts # Rate limiting
│   │   └── utils/           # Utility functions
│   ├── routes/              # SvelteKit routes
│   │   ├── (app)/          # Protected routes
│   │   ├── (auth)/         # Auth routes
│   │   └── api/            # API endpoints
│   ├── app.d.ts            # TypeScript types
│   ├── app.html            # HTML template
│   └── app.css             # Global styles
├── docker-compose.yml       # Development services
├── drizzle.config.ts       # Database configuration
└── package.json            # Dependencies
```

## Features & Tech Stack

### Frontend

- **SvelteKit 2** - Full-stack framework
- **Svelte 5** - UI framework with runes
- **Tailwind CSS v4** - Styling
- **TypeScript** - Type safety

### Backend

- **Better Auth** - Authentication
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database
- **Redis** - Rate limiting

### Development

- **Vite** - Build tool
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **ESLint** - Linting
- **Prettier** - Formatting

## Videos & Media

### YouTube Video Embeds

Videos are embedded from YouTube using video IDs or URLs:

```typescript
// Store YouTube URL in database
videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
// or just the ID
videoUrl: 'dQw4w9WgXcQ';
```

### Image URLs

For local development, use external image URLs:

```typescript
imageUrl: 'https://images.unsplash.com/photo-...';
```

Use external image/video URLs (e.g., Unsplash, YouTube) for images and videos.

## Troubleshooting

### Port Already in Use

If you see "port already in use" errors:

```bash
# Check what's using the port
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :5173  # Dev server

# Kill the process or change the port in docker-compose.yml
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Redis Connection Failed

```bash
# Check if Redis is running
docker-compose ps redis

# Check logs
docker-compose logs redis

# Test connection
docker exec -it splitshare-redis redis-cli -a redis_dev_password ping
```

### Emails Not Appearing

All emails are caught by Mailpit:

- Check http://localhost:8025
- Verify Mailpit is running: `docker-compose ps mailpit`
- Check logs: `docker-compose logs mailpit`

### Type Errors

```bash
# Clear SvelteKit cache
rm -rf .svelte-kit

# Regenerate types
npm run check
```

### Cannot Find Module

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Testing

### Unit Tests

```bash
# Run once
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### E2E Tests

```bash
# Install Playwright browsers (first time)
npx playwright install

# Run tests
npm run test:integration

# Run with UI
npx playwright test --ui
```

## Mobile Development (Capacitor)

### iOS

```bash
# Sync and open Xcode
npm run cap:ios

# Run on simulator from Xcode
```

### Android

```bash
# Sync and open Android Studio
npm run cap:android

# Run on emulator from Android Studio
```

## Environment Variables

All environment variables are in `.env`. See `.env.local.example` for local development defaults.

### Required for Local Development

- `DATABASE_URL` - PostgreSQL connection
- `BETTER_AUTH_SECRET` - Auth secret key

### Optional for Local Development

- `SENTRY_DSN` - Leave empty to disable error tracking
- `RESEND_API_KEY` - Not needed, using Mailpit
- `UPSTASH_REDIS_REST_URL` - Using local Redis

### Required for Production/CI Builds

#### Sentry (Optional at Runtime, Required at Build Time)

The application gracefully handles missing Sentry configuration at runtime, but the build process requires these variables to be defined:

- `SENTRY_DSN` - Sentry Data Source Name (can be empty string to disable)
- `SENTRY_AUTH_TOKEN` - Auth token for source maps (can be empty)
- `SENTRY_ORG` - Your Sentry organization slug (can be empty)
- `SENTRY_PROJECT` - Your Sentry project name (can be empty)

#### Setting Up CI/CD Builds

For CI pipelines where you don't want to configure Sentry, you need to ensure environment variables are available during the build. Here's the recommended approach:

```bash
# In your CI pipeline, before running npm run build:
cp .env.local.example .env

# Or set empty Sentry variables explicitly:
echo "SENTRY_DSN=" >> .env
echo "SENTRY_AUTH_TOKEN=" >> .env
echo "SENTRY_ORG=" >> .env
echo "SENTRY_PROJECT=" >> .env
```

The `.env.local.example` file contains all required variables with sensible defaults for development and placeholder values for optional services like Sentry.

**Important**: The following variables are truly required and must have valid values for the application to work:

- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Authentication secret key
- `UPSTASH_REDIS_REST_URL` - Redis connection for rate limiting

## Next Steps

1. **Create your first account**
   - Navigate to http://localhost:5173/register
   - Check email at http://localhost:8025

2. **Explore the database**
   - Run `npm run db:studio`
   - View tables and data

3. **Start building**
   - Add new routes in `src/routes/`
   - Create components in `src/lib/components/`
   - Update database schema in `src/lib/server/db/schema.ts`

## Resources

- [SvelteKit Docs](https://kit.svelte.dev)
- [Svelte 5 Docs](https://svelte-5-preview.vercel.app/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Better Auth Docs](https://www.better-auth.com)
- [Tailwind CSS Docs](https://tailwindcss.com)

## Getting Help

- Check the [SETUP.md](./SETUP.md) for production setup
- Review [README.md](./README.md) for project overview
- Open an issue on GitHub for bugs
- Check existing issues for common problems
