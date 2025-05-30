# Start Zero Auth

TanStack React Start starter templates with different authentication implementations.

## Quick Start

Choose your preferred authentication approach:

### Better Auth Template

```bash
cd start-zero-better-auth
bun install
bun db:up          # Start PostgreSQL
bun db:push        # Push schema
bun db:auth:push   # Push auth schema
bun zero-cache     # Start Zero Cache
bun dev            # Start dev server
```

### Supabase Auth Template

```bash
cd start-zero-supabase
bun install
bun db:up          # Start PostgreSQL
bun db:push        # Push schema
bun zero-cache     # Start Zero Cache
bun dev            # Start dev server
```

## Authentication Implementations

### start-zero-better-auth/

- **Framework:** TanStack React Start with Zero Sync
- **Auth:** [BetterAuth](https://www.better-auth.com/)
- **Database:** PostgreSQL with Docker
- **Features:**
  - Local database setup with Docker Compose
  - Full control over auth implementation
  - Drizzle ORM integration
  - Zero Sync for real-time data

### start-zero-supabase/

- **Framework:** TanStack React Start with Zero Sync
- **Auth:** [Supabase Auth](https://supabase.com/auth)
- **Database:** Supabase PostgreSQL
- **Features:**
  - Hosted database and auth
  - Built-in user management
  - Real-time subscriptions
  - Zero Sync integration

## Tech Stack

Both implementations share the same core stack:

- **Framework:** React 19 with TanStack React Start (SSR + file-based routing)
- **Data Sync:** Zero Sync with Zero Cache for real-time updates
- **Database ORM:** Drizzle with drizzle-zero integration
- **Routing:** TanStack Router (SPA-style client-side routing)
- **UI:** Tailwind CSS + Shadcn UI + Radix primitives
- **Forms:** TanStack Form with Zod validation
- **Tooling:** Bun, Biome (lint/format), Vitest

## Getting Started

1. **Choose your implementation** based on your needs:

   - **BetterAuth**: Full control, local development, custom auth flows
   - **Supabase**: Hosted solution, quick setup, built-in features

2. **Navigate to the chosen directory**:

   ```bash
   cd start-zero-better-auth  # or start-zero-supabase
   ```

3. **Follow the setup instructions** in that directory's README.md

## Credits

- Original project forked from [Austinm911 - TanStack Zero](https://github.com/austinm911/tanstack-zero)
- Added authentication implementations with BetterAuth and Supabase
- Added Zero custom mutators

## License

MIT License - see individual project directories for specific details.
