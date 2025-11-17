# Splitify

A mobile fitness app built with Capacitor + SvelteKit that allows users to create, share, and discover gym workout splits.

## Tech Stack

- **Frontend**: SvelteKit with TypeScript (Svelte 5 with runes)
- **Mobile**: Capacitor (iOS + Android)
- **Backend**: Supabase (PostgreSQL database, storage)
- **ORM**: Drizzle ORM
- **Authentication**: better-auth
- **Forms**: Superforms + Zod
- **UI**: shadcn-svelte + Tailwind CSS
- **Testing**: Vitest + Playwright

## Prerequisites

- Node.js 20.x or higher
- npm or pnpm
- PostgreSQL database (via Supabase or self-hosted)
- For mobile development:
  - Android Studio (for Android builds)
  - Xcode (for iOS builds, macOS only)

## Getting Started

### 1. Clone the repository

```bash
git clone git@github.com:rezk2ll/splitshare.git
cd splitshare
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the `.env.example` file to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `BETTER_AUTH_SECRET`: Secret key for better-auth (min 32 characters)
- `BETTER_AUTH_URL`: Your app URL (for development: http://localhost:5173)
- `PUBLIC_APP_URL`: Your app URL (for development: http://localhost:5173)

### 4. Set up the database

Generate the database schema and run migrations:

```bash
# Generate migration files
npm run db:generate

# Push schema to database
npm run db:push

# Or open Drizzle Studio to manage your database
npm run db:studio
```

### 5. Start the development server

```bash
npm run dev

# Or open in browser automatically
npm run dev -- --open
```

## Development Scripts

### Web Development

```bash
npm run dev              # Start development server
npm run build            # Create production build
npm run preview          # Preview production build
npm run check            # Type-check with svelte-check
npm run check:watch      # Watch mode for type-checking
```

### Code Quality

```bash
npm run lint             # Run prettier and eslint checks
npm run format           # Format code with prettier
```

### Testing

```bash
npm test                 # Run unit tests
npm run test:unit        # Run unit tests (alias)
npm run test:integration # Run Playwright integration tests
```

### Database

```bash
npm run db:generate      # Generate Drizzle migrations
npm run db:migrate       # Run migrations
npm run db:push          # Push schema to database
npm run db:studio        # Open Drizzle Studio
```

### Mobile Development

```bash
npm run cap:sync         # Build and sync with Capacitor
npm run cap:android      # Sync and open Android Studio
npm run cap:ios          # Sync and open Xcode
```

## Project Structure

```
splitshare/
├── src/
│   ├── lib/
│   │   ├── components/       # Reusable Svelte components
│   │   │   └── ui/           # shadcn-svelte UI components
│   │   ├── server/
│   │   │   ├── db/           # Drizzle schema and database client
│   │   │   └── auth/         # Lucia authentication configuration
│   │   ├── schemas/          # Zod validation schemas
│   │   ├── stores/           # Svelte stores for state management
│   │   └── utils/            # Utility functions
│   ├── routes/
│   │   ├── (auth)/           # Authentication routes (login, register)
│   │   ├── (app)/            # Protected app routes
│   │   │   ├── splits/       # Splits management
│   │   │   └── discover/     # Browse public splits
│   │   └── logout/           # Logout endpoint
│   ├── app.css               # Global styles with Tailwind
│   ├── app.html              # HTML template
│   └── app.d.ts              # TypeScript declarations
├── android/                  # Android native project (generated)
├── ios/                      # iOS native project (generated)
├── drizzle/                  # Drizzle migrations
├── .github/
│   └── workflows/            # GitHub Actions workflows
├── static/                   # Static assets
└── capacitor.config.ts       # Capacitor configuration
```

## Database Schema

### Users (better-auth compatible)

- `id`: Primary key
- `name`: User's display name
- `email`: Unique email address
- `emailVerified`: Email verification status
- `image`: Optional profile image
- `createdAt`, `updatedAt`: Timestamps

### Sessions (better-auth compatible)

- `id`: Session ID
- `userId`: Reference to user
- `expiresAt`: Session expiration
- `token`: Unique session token
- `ipAddress`, `userAgent`: Session metadata

### Accounts (better-auth compatible)

- Handles both OAuth and credential-based authentication
- `providerId`: Authentication provider (email, google, etc.)
- `password`: Hashed password for credential auth

### Verification

- Email verification tokens and other verification codes

### Exercises

- `id`: UUID
- `name`: Exercise name
- `muscle_group`: Target muscle group
- `equipment_type`: Required equipment

### Splits

- `id`: UUID
- `user_id`: Creator reference
- `title`: Split title
- `description`: Optional description
- `is_public`: Public/private flag
- `created_at`, `updated_at`: Timestamps

### Split Exercises

- Junction table linking splits to exercises
- Includes sets, reps, rest time, order, and notes

### Split Shares

- `id`: UUID
- `split_id`: Reference to split
- `share_token`: Unique share token
- `created_at`, `expires_at`: Share lifecycle

## CI/CD

The project includes GitHub Actions workflows:

### PR Checks (`pr-checks.yml`)

- Runs on pull requests
- Linting, type-checking, testing, and build verification

### Release (`release.yml`)

- Triggers on tags (`v*`)
- Builds web, Android, and iOS versions
- Publishes Docker image to GitHub Container Registry
- Creates GitHub releases with APK artifacts

## Mobile Development

### Android

1. Build and sync:

   ```bash
   npm run cap:android
   ```

2. Android Studio will open. Build and run from there.

### iOS

1. Build and sync:

   ```bash
   npm run cap:ios
   ```

2. Xcode will open. Build and run from there (requires macOS).

## Available Capacitor Plugins

- **Share API**: Share splits with others
- **Haptics**: Tactile feedback
- **Status Bar**: Control status bar appearance
- **Preferences**: Local storage for user preferences

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure all checks pass: `npm run lint && npm run check && npm test`
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.
