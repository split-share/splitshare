# SplitShare

A social fitness app that lets users create custom gym splits, share them with the community, and discover popular workout routines.

## Features

- **Custom Workout Splits** - Create and customize your own workout routines with drag-and-drop exercise organization
- **Workout Tracking** - Log workouts with exercises, sets, reps, weight, and rest timers
- **Personal Records** - Auto-tracked PRs with 1RM calculations
- **Progress Dashboard** - Stats, streaks, workout history, and muscle heatmap visualization
- **Progressive Overload** - Smart suggestions for weight progression based on your history
- **Community Forum** - Discuss fitness topics, share tips, and connect with others
- **Split Discovery** - Browse and filter community-shared workout splits
- **Social Features** - Like, comment, and review workout routines
- **Weight Tracking** - Track body weight over time with chart visualization
- **Mobile Apps** - iOS and Android support via Capacitor

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

### Frontend

- **SvelteKit 2** - Full-stack framework
- **Svelte 5** - UI framework with runes mode
- **shadcn-svelte** - UI component library (based on bits-ui)
- **Tailwind CSS v4** - Styling
- **TypeScript** - Type safety (strict mode)
- **layerchart** - Data visualization for progress charts

### Backend

- **Better Auth** - Authentication (email/password, 2FA, sessions)
- **Drizzle ORM** - Database ORM with PostgreSQL
- **PostgreSQL 16** - Database
- **Upstash Redis** - Rate limiting and caching
- **Resend** - Email service (Mailpit for local dev)
- **Pino** - Structured logging

### Mobile

- **Capacitor 7** - iOS + Android apps
- **Capacitor Preferences** - Local storage
- **Capacitor Share** - Native sharing

### Development

- **Vite 7** - Build tool
- **Vitest** - Unit testing with happy-dom
- **Playwright** - E2E testing
- **ESLint + Prettier** - Linting and formatting
- **Sentry** - Error monitoring (optional)

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
npm run dev -- --open    # Start dev server and open browser
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Lint and check formatting
npm run format           # Format code
npm run check            # Type checking
npm run check:watch      # Type checking in watch mode

# Testing
npm test                 # Run unit tests (Vitest)
npm run test:unit        # Alias for npm test
npm run test:integration # Run E2E tests (Playwright)
npm run test:coverage    # Run tests with coverage report

# Database
npm run db:push          # Push schema to database
npm run db:studio        # Open Drizzle Studio
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations

# Mobile
npm run cap:sync         # Sync web build with Capacitor
npm run cap:android      # Open Android Studio
npm run cap:ios          # Open Xcode
npm run mobile:build:android:debug    # Build Android debug APK
npm run mobile:build:android:release  # Build Android release APK
npm run mobile:build:ios:debug        # Build iOS debug
npm run mobile:build:ios:release      # Build iOS release
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

## Architecture

This project follows **Hexagonal Architecture (Ports & Adapters)** with clear separation of concerns:

```
src/
├── core/                    # Domain layer (business logic)
│   ├── domain/             # Entities and value objects
│   ├── usecases/           # Application use cases
│   └── ports/              # Interface contracts
├── adapters/               # Infrastructure implementations
│   ├── repositories/       # Drizzle ORM adapters
│   └── auth/              # Better Auth adapter
├── infrastructure/         # DI and cross-cutting concerns
│   └── di/                # Dependency injection container
└── routes/                # SvelteKit routes (HTTP layer)
```

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md) and [DEVELOPMENT.md](./DEVELOPMENT.md).

## Testing

The project has comprehensive test coverage:

### Unit Tests (Vitest)

```bash
npm test              # Run all unit tests
npm run test:coverage # Run with coverage report
```

Tests are located in `tests/unit/` and cover:

- Domain entities (business logic)
- Use cases (application logic)
- Schemas (validation)
- Utilities

### E2E Tests (Playwright)

```bash
npm run test:integration        # Run E2E tests
npx playwright test --ui       # Run with UI mode
```

Tests are located in `tests/e2e/` and cover:

- Authentication flows
- Protected routes
- API endpoints
- Navigation

## Project Structure

```
splitshare/
├── src/
│   ├── core/               # Domain logic (use cases, entities, ports)
│   ├── adapters/           # Infrastructure implementations
│   ├── infrastructure/     # DI container
│   ├── lib/               # Application layer (components, services)
│   │   ├── components/    # Svelte components
│   │   ├── server/        # Server-side utilities
│   │   └── schemas/       # Zod validation schemas
│   └── routes/            # SvelteKit routes
├── tests/
│   ├── unit/              # Unit tests
│   └── e2e/               # E2E tests
├── drizzle/               # Database migrations
└── android/ios/          # Capacitor mobile projects
```

## Documentation

- [README.md](./README.md) - This file (overview and quick start)
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Detailed development guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture overview
- [DOCKER.md](./DOCKER.md) - Docker setup and services
- [CLAUDE.md](./CLAUDE.md) - AI assistant guidelines

## Contributing

1. Follow the hexagonal architecture pattern
2. Add JSDoc comments to all public classes and methods
3. Write tests for new use cases and domain logic
4. Run `npm run lint` and `npm run check` before committing
5. Follow existing code style and patterns

## License

MIT
