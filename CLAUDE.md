# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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


## Core Workflow: Research → Plan → Implement → Validate

**Start every feature with:** "Let me research the codebase and create a plan before implementing."

1. **Research** - Understand existing patterns and architecture
2. **Plan** - Propose approach and verify with you
3. **Implement** - Build with tests and error handling
4. **Validate** - ALWAYS run formatters, linters, and tests after implementation

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
- NEVER add "Generated with Claude Code" links or branding
- NEVER add "Co-Authored-By: Claude" attribution
- Write clear, concise commit messages following the project's existing style
- Focus on what changed and why, not who or what tool made the changes

## design patterns

always use design patterns


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
