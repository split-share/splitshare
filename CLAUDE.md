# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
npm test                # Run unit tests
npm run test:unit       # Run unit tests (alias)
npm run test:integration # Run Playwright integration tests
```

### Code Quality

```bash
npm run lint    # Run prettier and eslint checks
npm run format  # Format code with prettier
npm run check   # Type-check with svelte-check
npm run check:watch # Watch mode for type-checking
```

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

## Available MCP Tools:

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
// ❌ BAD: Type hacking
bind:value={value as never}
const data = response as any;
// @ts-ignore
someFunction();

// ✅ GOOD: Proper typing
bind:value={value}  // Fix the component to accept the right type
const data: ExpectedType = validateResponse(response);
interface FormData { ... }
const data: FormData = await request.formData();
```

## Core Workflow: Research → Plan → Implement → Validate

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

## Design Patterns

Always use design patterns to maintain clean architecture.

## Service-Based Architecture

**NEVER put database operations or business logic in form actions or load functions.**

### Layer Structure

```
src/lib/services/
├── [domain]/
│   ├── [domain].repository.ts   # Data access layer (queries, inserts, updates)
│   ├── [domain].service.ts      # Business logic layer (validation, orchestration)
│   └── types.ts                 # Domain-specific types
└── shared/
    └── utils.ts                 # Shared service utilities
```

### Design Patterns to Use

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

4. **Factory Pattern** - Complex object creation
   - Use for entities with complex initialization
   - Centralize creation logic

### Rules

1. **Form actions and load functions** - Only handle HTTP concerns
   - Request/response handling
   - Validation with schemas
   - Call service methods
   - Return results

2. **Services** - Business logic only
   - No HTTP concerns (no Request/Response objects)
   - Coordinate repositories
   - Enforce business rules
   - Handle transactions

3. **Repositories** - Data access only
   - All database queries
   - Simple CRUD operations
   - No business logic
   - Return raw data or domain types

4. **Shared utilities** - Pure functions
   - Extract common logic to `src/lib/utils/`
   - Must be stateless
   - No side effects

### Example Structure

```typescript
// ❌ BAD: Database logic in form action
export const actions = {
  create: async (event) => {
    await db.insert(splits).values({...});
  }
};

// ✅ GOOD: Service layer handles logic
export const actions = {
  create: async (event) => {
    const split = await splitService.createSplit(data, userId);
    return { split };
  }
};
```

## Documentation Style Guidelines

When writing documentation:

- **Be concise and practical** - Only document what developers actually need to know
- **No obvious warnings** - Don't state things like "the build will fail if required variables aren't set" or "the app won't work without configuration"
- **No redundant notes** - Avoid "Note:", "Important:", "Remember:" unless it's genuinely non-obvious
- **Focus on the how, not the why-it-matters** - Assume developers understand basic cause and effect
- **Skip CI/CD speculation** - Don't add notes about CI/CD, deployment, or build failures unless specifically relevant
- **No hand-holding** - Developers know that missing required config breaks things

### Good Documentation Example:

```
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
```

### Bad Documentation Example:

```
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key

**Note**: Make sure to set these variables or the application won't be able to connect to Supabase.
**Important**: In CI/CD environments, ensure these are configured as secrets.
**Remember**: Never commit these values to version control.
```

Keep documentation minimal, actionable, and respect the reader's intelligence.
