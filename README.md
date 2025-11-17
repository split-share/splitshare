# SplitShare

A social fitness app that lets users create custom gym splits, share them with the community, and discover popular workout routines.

## Quick Start

```bash
# 1. Clone and install
git clone git@github.com:rezk2ll/splitshare.git
cd splitshare
npm install

# 2. Start infrastructure (PostgreSQL, Redis, Mailpit)
docker-compose up -d

# 3. Configure environment
cp .env.local.example .env

# 4. Set up database
npm run db:push

# 5. Start dev server
npm run dev
```

Open http://localhost:5173

For detailed setup instructions, see [DEVELOPMENT.md](./DEVELOPMENT.md)

## Tech Stack

- **SvelteKit 2** - Full-stack framework
- **Svelte 5** - UI framework with runes
- **Tailwind CSS v4** - Styling
- **TypeScript** - Type safety
- **Better Auth** - Authentication
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database
- **Redis** - Rate limiting
- **Capacitor 7** - iOS + Android apps

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Git

For mobile development:
- Android Studio (Android)
- Xcode (iOS, macOS only)

## Development

### Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Lint and check formatting
npm run format           # Format code
npm run check            # Type checking

# Testing
npm test                 # Run tests
npm run test:integration # Run Playwright tests

# Database
npm run db:push          # Push schema to database
npm run db:studio        # Open Drizzle Studio
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations

# Mobile
npm run cap:sync         # Sync with Capacitor
npm run cap:android      # Open Android Studio
npm run cap:ios          # Open Xcode
```

### Docker Services

The project includes local development services:

- **PostgreSQL 16** (port 5432)
- **Redis 7** (port 6379)
- **Mailpit** (ports 1025, 8025)

```bash
docker-compose up -d     # Start services
docker-compose ps        # View status
docker-compose logs -f   # View logs
docker-compose down      # Stop services
```

## License

MIT
