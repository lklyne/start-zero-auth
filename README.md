# Start Zero Auth - Starter Templates

This repository contains two complete starter templates for building modern web applications with real-time data synchronization and authentication:

## 🚀 Templates

### 1. Better Auth Template (`start-zero-better-auth/`)

A complete starter using **Better Auth** for authentication with JWT support.

**Features:**

- 🔐 Better Auth with JWT tokens
- 📧 Email/password authentication
- 🌐 Social login (Google)
- 🔄 Real-time data sync with Zero
- 💾 PostgreSQL with Drizzle ORM
- 🎨 Modern UI with Shadcn/UI

### 2. Supabase Auth Template (`start-zero-supabase/`)

A complete starter using **Supabase Auth** for authentication.

**Features:**

- 🔐 Supabase Auth
- 📧 Email/password authentication
- 🌐 Social login support
- 🔄 Real-time data sync with Zero
- 💾 PostgreSQL with Drizzle ORM
- 🎨 Modern UI with Shadcn/UI

## 🛠 Tech Stack

Both templates share the same modern tech stack:

- **Framework:** React 19 with TanStack React Start (SSR + file-based routing)
- **Data Sync:** Zero Sync for real-time client/server synchronization
- **Database:** PostgreSQL with Drizzle ORM
- **UI:** Tailwind CSS + Shadcn/UI components
- **Forms:** TanStack Form with Zod validation
- **Tooling:** Bun, Biome (lint/format), Vitest
- **Email:** React Email + Resend

## 🚀 Quick Start

Choose your preferred authentication method:

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

## 📚 Documentation

Each template includes detailed documentation:

- Setup and configuration guides
- Authentication flow explanations
- Database schema management
- Real-time sync patterns
- Email template workflows

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see individual template directories for details.
