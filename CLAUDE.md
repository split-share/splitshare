# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SplitShare** - A fitness workout splits sharing platform with web and mobile support (Capacitor).

## Svelte Version

**ALWAYS use Svelte 5 with runes mode:**

- Use `$state`, `$derived`, `$effect` instead of reactive declarations
- Use `{#snippet}` instead of slots with `let:` directives
- Use `{@render}` to render snippets
- Avoid legacy Svelte 4 patterns like `let:builder` or slot props

### Development Server

```bash
npm run dev              # Start development server
npm run dev -- --open    # Start dev server and open in browser
```

### Building

```bash
npm run build    # Create production build
npm run preview  # Preview production build
```

### Testing

```bash
npm test                 # Run unit tests (Vitest with happy-dom)
npm run test:unit        # Run unit tests (alias)
npm run test:integration # Run Playwright integration tests
```

### Code Quality

```bash
npm run lint    # Run prettier and eslint checks
npm run format  # Format code with prettier
npm run check   # Type-check with svelte-check
npm run check:watch # Watch mode for type-checking
```

## Tech Stack

**Core:**

- SvelteKit 2 with Svelte 5 (runes mode)
- TypeScript (strict mode)
- Vite 7

**Database:**

- PostgreSQL with Drizzle ORM
- Schema: `src/lib/server/db/schema.ts`
- Migrations: `drizzle/migrations/`

**Authentication:**

- Better Auth (email/password, session-based)
- 7-day session expiration
- Drizzle adapter integration

**UI:**

- shadcn-svelte (built on bits-ui)
- Tailwind CSS 4
- Lucide icons
- layerchart for data visualization

**Services:**

- Upstash Redis for rate limiting
- Resend for email (Mailpit for local dev)
- Sentry for error monitoring (optional)
- Pino for structured logging

**Mobile:**

- Capacitor for iOS/Android
- Shared codebase with web

**Testing:**

- Vitest with happy-dom for unit tests
- Playwright for E2E tests
- Testing Library for component tests

## UI Components

**ALWAYS use shadcn-svelte components:**

- Official documentation: https://www.shadcn-svelte.com/docs/components
- Component list: https://www.shadcn-svelte.com/docs/components.md
- **Get markdown documentation**: Add `.md` to any component URL
  - Example: https://www.shadcn-svelte.com/docs/components/card.md
  - Example: https://www.shadcn-svelte.com/docs/components/button.md
- Use ONLY shadcn-svelte components from `$lib/components/ui/`
- Follow Svelte 5 patterns (no `let:builder` or slot props)
- Use component snippets when needed with `{#snippet}` and `{@render}`

**CRITICAL RULES:**

- **NEVER revert from shadcn components to vanilla HTML elements** (e.g., never replace `<Select>` with `<select>`, `<Button>` with `<button>`)
- If a shadcn component has issues, FIX the component - do not replace it with vanilla HTML
- Always research the proper shadcn/bits-ui API before reverting to vanilla elements
- When blocked, consult documentation at https://www.bits-ui.com or https://www.shadcn-svelte.com

## Available MCP Tools

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

## TypeScript Standards

**Strict type safety - NO COMPROMISES:**

- **NEVER use `any` type** - Always define proper types or use `unknown` with type guards
- **NEVER use type hacks** like `as never`, `as any`, or excessive `as` casting to bypass type errors
- **NEVER suppress TypeScript errors** with `@ts-ignore` or `@ts-expect-error` without explicit approval
- If types don't match, FIX the underlying issue - don't hack around it
- Use proper generic constraints and type inference
- Define interfaces and types for all data structures
- When stuck on types, research the library's type definitions or ask for guidance

**Examples:**

```typescript
// BAD: Type hacking
bind:value={value as never}
const data = response as any;
// @ts-ignore
someFunction();

// GOOD: Proper typing
bind:value={value}  // Fix the component to accept the right type
const data: ExpectedType = validateResponse(response);
interface FormData { ... }
const data: FormData = await request.formData();
```

## JSDoc Documentation

**ALWAYS add JSDoc comments to:**

- All public classes, interfaces, and types
- All public methods and functions
- All use cases (class and execute method)
- All repository methods
- Complex or non-obvious logic

**JSDoc Format:**

Use the standard JSDoc format with type annotations:

```typescript
/**
 * Brief description of what this does
 * @param {Type} paramName - Description of the parameter
 * @param {Type} anotherParam - Description of another parameter
 * @returns {ReturnType} Description of return value
 * @throws {ErrorType} When this error occurs
 */
async execute(paramName: Type, anotherParam: Type): Promise<ReturnType> {
  // implementation
}
```

**Examples:**

```typescript
// GOOD: Proper JSDoc
/**
 * Creates a new review for a split
 * Validates split exists, checks for duplicate reviews, and verifies user eligibility
 */
export class CreateReviewUseCase {
	/**
	 * Creates a new review for a split
	 * @param {CreateReviewDto} input - Review data (userId, splitId, rating, content)
	 * @returns {Promise<Review>} The created review entity
	 * @throws {NotFoundError} If split doesn't exist
	 * @throws {AlreadyExistsError} If user has already reviewed this split
	 * @throws {BusinessRuleError} If user hasn't completed a workout with this split
	 */
	async execute(input: CreateReviewDto): Promise<Review> {
		// implementation
	}
}

// BAD: No documentation
export class CreateReviewUseCase {
	async execute(input: CreateReviewDto): Promise<Review> {
		// implementation
	}
}
```

## Core Workflow: Research, Plan, Implement, Validate

**Start every feature with:** "Let me research the codebase and create a plan before implementing."

1. **Research** - Understand existing patterns and architecture
2. **Plan** - Propose approach and verify with you
3. **Implement** - Build with tests and error handling
4. **Validate** - ALWAYS run these checks before completing a feature:
   ```bash
   npm run lint    # Check code formatting and linting
   npm run check   # Type-check with svelte-check
   npm run test    # Run all unit tests
   ```
   Fix any errors before committing. Never commit broken code.

## Code Organization

**Keep functions small and focused:**

- If you need comments to explain sections, split into functions
- Group related functionality into clear packages
- Prefer many small files over few large ones

## Architecture Principles

**This is always a feature branch:**

- Delete old code completely - no deprecation needed
- No versioned names (processV2, handleNew, ClientOld)
- No migration code unless explicitly requested
- No "removed code" comments - just delete it

**Prefer explicit over implicit:**

- Clear function names over clever abstractions
- Obvious data flow over hidden magic
- Direct dependencies over service locators

## Maximize Efficiency

**Parallel operations:** Run multiple searches, reads, and greps in single messages
**Multiple agents:** Split complex tasks - one for tests, one for implementation
**Batch similar work:** Group related file edits together

## Problem Solving

**When stuck:** Stop. The simple solution is usually correct.

**When uncertain:** "Let me ultrathink about this architecture."

**When choosing:** "I see approach A (simple) vs B (flexible). Which do you prefer?"

Your redirects prevent over-engineering. When uncertain about implementation, stop and ask for guidance.

## Testing Strategy

**Match testing approach to code complexity:**

- Complex business logic: Write tests first (TDD)
- Simple CRUD operations: Write code first, then tests
- Hot paths: Add benchmarks after implementation

**Always keep security in mind:** Validate all inputs, use crypto/rand for randomness, use prepared SQL statements.

**Performance rule:** Measure before optimizing. No guessing.

## Progress Tracking

- **TodoWrite** for task management
- **Clear naming** in all code

Focus on maintainable solutions over clever abstractions.

## Git Commit Messages

**Keep commits clean and professional:**

- NEVER add "Generated with Claude Code" links or branding in commit messages
- NEVER add "Co-Authored-By: Claude" attribution in commit messages
- NEVER include any Claude-related metadata or signatures
- Write clear, concise commit messages following the project's existing style
- Focus on what changed and why, not who or what tool made the changes
- Commits should appear as if written by a human developer

## Clean Architecture

This project follows Clean/Hexagonal Architecture with clear separation of concerns.

### Directory Structure

```
src/
├── core/                      # Domain layer (business logic)
│   ├── domain/                # Entities and value objects
│   │   ├── exercise/
│   │   ├── split/
│   │   ├── weight/
│   │   ├── workout/
│   │   └── common/
│   ├── ports/                 # Interface contracts (abstractions)
│   │   ├── auth/
│   │   ├── cache/
│   │   ├── email/
│   │   ├── repositories/
│   │   └── storage/
│   └── usecases/              # Application use cases
│       ├── exercise/
│       ├── split/
│       ├── weight/
│       └── workout/
├── adapters/                  # Infrastructure adapters
│   ├── auth/
│   │   └── better-auth/       # Better Auth implementation
│   └── repositories/
│       └── drizzle/           # Drizzle ORM repositories
├── infrastructure/            # DI and cross-cutting concerns
│   └── di/
│       └── container.ts       # Dependency injection container
├── lib/                       # Application layer
│   ├── components/
│   │   ├── forms/
│   │   ├── modals/
│   │   ├── ui/                # shadcn-svelte components
│   │   └── workout/
│   ├── server/
│   │   ├── auth/              # Better Auth initialization
│   │   ├── db/                # Drizzle client and schema
│   │   ├── email.ts           # Resend email service
│   │   └── rate-limit.ts      # Upstash rate limiting
│   ├── schemas/               # Zod validation schemas
│   ├── services/              # Legacy services (being migrated)
│   ├── utils/
│   ├── api-client.ts          # Fetch wrapper for API calls
│   ├── auth-client.ts         # Better Auth client
│   ├── config.ts              # Environment configuration
│   └── constants.ts           # App constants
└── routes/                    # SvelteKit routes
    ├── api/                   # API endpoints (+server.ts)
    ├── (app)/                 # Authenticated routes
    ├── (auth)/                # Public auth routes
    └── discover/              # Public content
```

### Path Aliases

```typescript
import { ... } from '$core/domain/split';      // Domain entities
import { ... } from '$core/ports/repositories'; // Port interfaces
import { ... } from '$core/usecases/split';     // Use cases
import { ... } from '$adapters/repositories/drizzle'; // Adapters
import { container } from '$infrastructure/di/container'; // DI
import { ... } from '$lib/components/ui';       // UI components
```

### Design Patterns

1. **Repository Pattern** - Encapsulate all data access
   - All database queries in repositories
   - Repository methods return domain types
   - Inject database instance via constructor

2. **Service Layer Pattern** - Business logic coordination
   - Services orchestrate repositories
   - Handle transactions and complex operations
   - Validate business rules

3. **Dependency Injection** - Constructor-based DI
   - Pass dependencies through constructors
   - Makes testing easier with mocks
   - Lazy singleton container in `$infrastructure/di/container.ts`

4. **Factory Pattern** - Complex object creation
   - Use for entities with complex initialization
   - Centralize creation logic

5. **Ports & Adapters** - Hexagonal architecture
   - Ports define interfaces in `$core/ports/`
   - Adapters implement interfaces in `$adapters/`
   - Swap implementations without changing domain

### Layer Rules

1. **Domain (`src/core/domain/`)** - Pure business logic
   - Entity classes with validation methods
   - Value objects
   - No external dependencies

2. **Ports (`src/core/ports/`)** - Interface contracts
   - Repository interfaces
   - Service abstractions
   - Define what, not how

3. **Use Cases (`src/core/usecases/`)** - Application orchestration
   - Coordinate domain entities and repositories
   - Business rule enforcement
   - Transaction boundaries

4. **Adapters (`src/adapters/`)** - External implementations
   - Drizzle repositories implement port interfaces
   - Better Auth adapter
   - Can be swapped without changing domain

5. **Infrastructure (`src/infrastructure/`)** - DI and cross-cutting
   - Lazy singleton container
   - Wire up adapters to ports

6. **Routes** - HTTP concerns only
   - Request/response handling
   - Validation with Zod schemas
   - Delegate to use cases via container

### Example Flow

```typescript
// Route: Call use case from container
export const actions = {
	create: async (event) => {
		const validation = createSplitSchema.safeParse(data);
		if (!validation.success) return fail(400, { errors: validation.error });

		const split = await container.createSplitUseCase.execute(validation.data, userId);
		return { split };
	}
};

// Use Case: Orchestrate domain logic
class CreateSplitUseCase {
	constructor(private splitRepository: SplitRepositoryPort) {}

	async execute(input: CreateSplitInput, userId: string) {
		Split.validateTitle(input.title);
		Split.validateDifficulty(input.difficulty);
		return this.splitRepository.create({ ...input, userId });
	}
}

// Adapter: Implement port with Drizzle
class DrizzleSplitRepository implements SplitRepositoryPort {
	constructor(private db: DrizzleClient) {}

	async create(data: CreateSplitData) {
		return this.db.insert(splits).values(data).returning();
	}
}
```

## Form Handling

**Validation:** Zod schemas in `src/lib/schemas/`

```typescript
// Define schema
export const createSplitSchema = z.object({
	title: z.string().min(3).max(100),
	description: z.string().max(500).optional(),
	difficulty: z.enum(['beginner', 'intermediate', 'advanced'])
});

export type CreateSplitInput = z.infer<typeof createSplitSchema>;

// Use in form action
const validation = createSplitSchema.safeParse(data);
if (!validation.success) {
	return fail(400, { errors: validation.error.flatten() });
}
```

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Authentication (Better Auth)
BETTER_AUTH_SECRET=your_secret
BETTER_AUTH_URL=http://localhost:5173
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:5173

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com

# Error Monitoring (Optional)
SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=...
SENTRY_ORG=...
SENTRY_PROJECT=...

# Application
PUBLIC_APP_URL=http://localhost:5173
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:5173

# Logging
LOG_LEVEL=debug   # trace, debug, info, warn, error, fatal
```

## Logging

Uses Pino for structured JSON logging following the "Wide Events" pattern.

### Architecture

```
src/
├── core/ports/logger/logger.port.ts     # Logger interface
├── adapters/logger/pino/                # Pino implementation
└── lib/server/logger/
    ├── index.ts                         # Logger singleton & exports
    ├── request-context.ts               # Wide event builder
    └── action-logger.ts                 # Action logging helper
```

### Usage in Routes

```typescript
import { logAction } from '$lib/server/logger';

// Log user actions with business context
logAction(event, 'split.create', {
	success: true,
	resourceId: split.id,
	resourceType: 'split',
	metadata: { title, isPublic }
});

// Use request-scoped logger
event.locals.logger.info('Something happened', { splitId });
```

### Action Types

Use predefined action types for consistency:

- `split.create`, `split.update`, `split.delete`, `split.like`, `split.unlike`, `split.view`
- `exercise.create`, `exercise.update`, `exercise.delete`
- `comment.create`, `comment.update`, `comment.delete`
- `workout.start`, `workout.complete`, `workout.abandon`, `workout.set_complete`, `workout.log`
- `weight.add`, `weight.delete`
- `forum.topic_create`, `forum.post_create`, `forum.post_update`, `forum.post_delete`

### Rules

- **NEVER use `console.log/error`** in server code - use `logger` or `logAction`
- **Log all user actions** that modify data (create, update, delete, like, etc.)
- **Include business context**: resourceId, resourceType, relevant metadata
- **Log both success and failure** for actions
- **Don't log**: static assets, `__data.json` requests, high-frequency sync operations
- Client-side code may use `console.error` for debugging (no server logger access)

### Environment Variables

```bash
LOG_LEVEL=debug   # trace, debug, info, warn, error, fatal (default: debug in dev, info in prod)
```

## Local Development Services

Docker Compose provides:

- PostgreSQL (5432)
- Redis (6379)
- Mailpit for email testing (8025)
- pgAdmin (5050)
- Redis Commander (8081)

## Documentation Style Guidelines

When writing documentation:

- **Be concise and practical** - Only document what developers actually need to know
- **No obvious warnings** - Don't state things like "the build will fail if required variables aren't set"
- **No redundant notes** - Avoid "Note:", "Important:", "Remember:" unless genuinely non-obvious
- **Focus on the how, not the why-it-matters** - Assume developers understand basic cause and effect
- **No hand-holding** - Developers know that missing required config breaks things

Keep documentation minimal, actionable, and respect the reader's intelligence.
