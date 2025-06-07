# Tanstack React Start + Zero Starter

A modern full-stack starter with Supabase authentication, Zero Sync for real-time data, and TanStack Start.

## Quick Start

### Option 1: Local Development (Recommended)

```bash
# Install dependencies
bun install

# Set up environment
cp .env.local.example .env

# Start local Supabase
bun supabase:start

# Push the schema to the database
bun db:push

# Start Zero Cache
bun zero-cache

# Start dev server (in another terminal)
bun dev
```

### Option 2: Cloud Supabase

```bash
# Install dependencies
bun install

# Set up environment
cp .env.cloud.example .env
# Edit .env with your Supabase project credentials

# Push the schema to the database
bun db:push

# Start Zero Cache
bun zero-cache

# Start dev server
bun dev
```

## Stack

- Tanstack Start
- Zero Sync
- Supabase
- Drizzle
- Shadcn
- Biome
- React Email
- Resend
- Shadcn UI

## Available Scripts

### Supabase Management

```bash
bun supabase:start    # Start local Supabase services
bun supabase:stop     # Stop local Supabase services
bun supabase:status   # Check status of local services
bun supabase:reset    # Reset local database to initial state
bun db:seed           # Reset and seed database
```

### Development

```bash
bun dev               # Start development server
bun zero-cache        # Start Zero cache server
bun build             # Build for production
```

### Database & Schema

```bash
bun db:push           # Push schema changes to database
bun db:generate       # Generate migration files
bun db:migrate        # Apply migrations
bun db:studio         # Open Drizzle Studio
bun db:zero:generate  # Generate Zero schema
```

## Schema workflow

- Edit your Drizzle schema in `src/db/schema.ts`.
- Run `bun db:zero:generate` to update your Zero schema.
- Run `bun db:generate` to scaffold a migration.
- Apply with `bun db:migrate` (or `bun db:push` to force-sync).
- Restart Zero cache (`bun zero-cache`).
- Restart your dev server (`bun dev`).

## Email workflow

- Edit your React Email templates in `src/emails`.
- Run `bun email:dev` to start the email server.
- Run `bun email:export` to export the emails.
- Run `bun email:send` to send an email.

## Troubleshooting

### Zero Cache "Port in Use" Error

If you get an error when running `bun zero-cache` that the port is already in use, you can kill existing zero-cache processes:

```bash
# Kill all zero-cache processes
pkill -f zero-cache

# Then restart zero-cache
bun zero-cache
```

Alternatively, you can find and kill specific processes:

```bash
# Find zero-cache processes
ps aux | grep zero-cache

# Kill by PID (replace XXXX with actual PID)
kill XXXX
```
