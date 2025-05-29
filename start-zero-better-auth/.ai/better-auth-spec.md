# Better Auth Implementation Plan

## Overview

This plan outlines the steps to integrate Better Auth with a separate database while using Drizzle as the ORM, similar to the existing Zero DB setup.

## Step 1: Update Docker Configuration

- Add a new PostgreSQL service (e.g., `postgres-auth`) for Better Auth in `docker/docker-compose.yml`
- Configure it to run on port 5431 (not conflicting with the main DB)
- Set up volumes for persistent data storage
- Create network configuration to allow communication between services

## Step 2: Environment Configuration

- Create environment variables for Better Auth in `.env` and `.env.example`
- Include variables for the auth database connection (e.g., `AUTH_DATABASE_URL`)
- Add secrets for Better Auth (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`)

## Step 3: Database Setup

- Create a Drizzle schema file specifically for Better Auth tables (e.g., `src/db/auth-schema.ts`)
- Set up a Drizzle client instance connected to the auth database (e.g., `src/db/auth-db.ts`)
- Use the Better Auth CLI to **generate** the required schema definitions for Drizzle:
  ```bash
  # This will output schema definitions or potentially a migration file content
  npx @better-auth/cli generate
  ```
- Add the generated schema definitions (tables, relations, etc.) from the previous step into your `src/db/auth-schema.ts` file.
- Use drizzle-kit to **generate** the SQL migration file based on the updated `auth-schema.ts`:
  ```bash
  # Ensure this command targets the auth schema and configuration
  bun drizzle-kit generate # Adjust command as needed for your project setup
  ```
- Use drizzle-kit to **apply** the generated migration to the auth database:
  ```bash
  # Ensure this command targets the auth database connection
  bun drizzle-kit migrate # Adjust command as needed for your project setup
  ```

## Step 4: Better Auth Configuration

- Create the auth instance in `src/lib/auth.ts`
- Import the Drizzle adapter (e.g., `import { drizzleAdapter } from "better-auth/adapters/drizzle";`)
- Configure Better Auth to use the `drizzleAdapter`, passing it the Drizzle client instance connected to the **auth database** (`src/db/auth-db.ts`).
- Configure desired authentication methods (e.g., `emailAndPassword`, `socialProviders`).

## Step 5: API Route Handlers

- Create the catch-all API route handler in your framework's designated location (e.g., `src/routes/api/auth/$.ts` or `app/routes/api/auth/$.ts`).
- Use TanStack Start's `createAPIFileRoute` (or equivalent).
- Implement `GET` and `POST` methods that call `auth.handler(request)` from your Better Auth instance created in `src/lib/auth.ts`.

## Step 6: Client-Side Integration

- Create a client-side auth integration file (e.g., `src/lib/auth-client.ts`).
- Use `createAuthClient` from the appropriate Better Auth package (e.g., `better-auth/react`).
- Export necessary functions/hooks (`signIn`, `signUp`, `signOut`, `getSession`, potentially `useSession`) for use in UI components.

## Step 7: UI Components & Session Management

- Create login/signup forms and integrate them with the `authClient` methods.
- Implement logout functionality.
- Manage client-side session state (e.g., using `authClient.getSession()` or `useSession` hook, possibly with TanStack Query or React Context) to show user info and control access to protected routes/features.
- For server-side rendering or API routes needing user data, use `auth.api.getSession({ headers })`, passing the request headers object.

## Step 8: Testing

- Test the full authentication flow: signup, login, logout, session persistence, protected routes.
- Verify database connections and that migrations applied correctly to the auth database.
- Check error handling for invalid credentials or other auth failures.

## Step 9: Production Considerations

- Securely manage environment variables and secrets.
- Plan for database backups for the auth database.
- Consider rate limiting, password policies, and other security best practices for the auth endpoints.

This implementation plan provides a minimal but complete approach to adding Better Auth with a separate database while following the project's existing patterns.
