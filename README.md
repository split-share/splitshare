# SplitShare

A social fitness app that lets users create custom gym splits, share them with the community, and discover popular workout routines.

## Quick Start

### Automated Setup (Recommended)

```bash
# 1. Clone the repository
git clone git@github.com:rezk2ll/splitshare.git
cd splitshare

# 2. Run automated setup
./docker-setup.sh

# 3. Start development server
npm run dev
```

Open http://localhost:5173

### Manual Setup

```bash
# 1. Clone and install
git clone git@github.com:rezk2ll/splitshare.git
cd splitshare
npm install

# 2. Start infrastructure
docker compose up -d

# 3. Configure environment
cp .env.example .env
# Generate secret: openssl rand -base64 32
# Update BETTER_AUTH_SECRET in .env

# 4. Set up database
npm run db:push

# 5. Start dev server
npm run dev
```

For detailed instructions, see [DOCKER.md](./DOCKER.md) or [DEVELOPMENT.md](./DEVELOPMENT.md)

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

The project includes comprehensive local development infrastructure:

**Core Services:**

- **PostgreSQL 16** (port 5432) - Database
- **Redis 7** (port 6379) - Rate limiting
- **Upstash Proxy** (port 8079) - Redis HTTP interface
- **Mailpit** (ports 1025, 8025) - Email testing

**Optional Services:**

- **pgAdmin** (port 5050) - Database management UI
- **Redis Commander** (port 8081) - Redis management UI

```bash
# Core services
docker compose up -d

# With management tools
docker compose --profile tools up -d

# View status and logs
docker compose ps
docker compose logs -f

# Stop services
docker compose down
```

See [DOCKER.md](./DOCKER.md) for complete documentation.

## License

MIT
