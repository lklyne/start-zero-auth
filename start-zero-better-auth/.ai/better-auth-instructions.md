# Better Auth Implementation Guide

This guide provides detailed steps and code examples to integrate Better Auth into your TanStack Start project using a separate PostgreSQL database managed with Drizzle, following the plan outlined in `.ai/better-auth-spec.md`.

---

## Step 1: Update Docker Configuration

**Goal:** Add a separate PostgreSQL container for the authentication database.

**File to Modify:** `docker/docker-compose.yml`

**Changes:**
Add a new service definition for the auth database. Ensure the port and volume names are unique.

```yaml
version: '3.8'
services:
  # ... existing services (e.g., postgres for main db, web app)

  postgres-auth:
    image: postgres:16 # Or your preferred version
    container_name: postgres-auth
    ports:
      - '5431:5432' # Expose auth db on host port 5431
    environment:
      POSTGRES_DB: auth_db
      POSTGRES_USER: auth_user
      POSTGRES_PASSWORD: auth_password # Use a strong password, preferably from env vars
    volumes:
      - postgres_auth_data:/var/lib/postgresql/data
    networks:
      - default # Ensure it's on the same network as your app service if needed

  # ... other services

volumes:
  # ... existing volumes
  postgres_auth_data:

networks:
  default:
    # ... network configuration
```

**Stop and Test:**

1.  Run `docker compose up -d postgres-auth` (or `docker compose up -d` to bring up everything).
2.  Verify the `postgres-auth` container is running using `docker ps`.
3.  Optionally, connect to the database using a tool like `psql` or a GUI client (e.g., TablePlus, DBeaver) on `localhost:5431` with the credentials `auth_user`/`auth_password` to confirm connectivity.

---

## Step 2: Environment Configuration

**Goal:** Set up environment variables for the auth database connection and Better Auth secrets.

**Files to Modify:**

- `.env` (for local development)
- `.env.example` (to document required variables)

**Changes:**
Add the necessary variables to both files. Generate a strong secret for `BETTER_AUTH_SECRET`.

```dotenv
# .env / .env.example

# --- Existing variables ---
# DATABASE_URL=postgresql://user:password@localhost:5432/main_db
# ... other vars

# --- Better Auth Variables ---
# Connection URL for the separate auth database
AUTH_DATABASE_URL="postgresql://auth_user:auth_password@localhost:5431/auth_db"

# Better Auth secret key (generate a strong random string - e.g., `openssl rand -hex 32`)
BETTER_AUTH_SECRET="YOUR_STRONG_RANDOM_SECRET_HERE"

# Base URL of your application (where Better Auth callbacks will redirect)
# Make sure this matches where your app is running during development
BETTER_AUTH_URL="http://localhost:3000"

# Optional: Add social provider keys if you plan to use them later
# GITHUB_CLIENT_ID=...
# GITHUB_CLIENT_SECRET=...
```

**Stop and Test:**

1.  Restart your application server if it's running to ensure it picks up the new environment variables.
2.  You can temporarily add `console.log(process.env.AUTH_DATABASE_URL)` and `console.log(process.env.BETTER_AUTH_SECRET)` somewhere in your server startup code (and then remove it) to verify they are loaded correctly.

---

## Step 3: Database Setup

**Goal:** Define the Drizzle schema for Better Auth tables, connect Drizzle to the auth database, and run migrations.

**Files to Create/Modify:**

1.  **`src/db/auth-schema.ts`** (Create New): Define a schema file specifically for auth tables.
2.  **`src/db/auth-db.ts`** (Create New): Set up the Drizzle client instance for the auth database.
3.  **`drizzle.config.auth.ts`** (Create New): Create a separate Drizzle Kit config file for the auth database migrations.
4.  **`package.json`** (Modify): Add script commands for auth DB migrations.

**Changes:**

**1. `drizzle.config.auth.ts`:**
Configure Drizzle Kit to use the auth schema and database connection.

```typescript
import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env' }) // Load .env file

if (!process.env.AUTH_DATABASE_URL) {
  throw new Error('AUTH_DATABASE_URL environment variable is required.')
}

export default defineConfig({
  schema: './src/db/auth-schema.ts', // Path to your auth schema
  out: './drizzle/auth', // Output directory for auth migrations
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.AUTH_DATABASE_URL,
  },
  verbose: true,
  strict: true,
})
```

**2. `src/db/auth-db.ts`:**
Create the Drizzle client instance for the auth database.

```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './auth-schema' // Import the auth schema we will create next
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env' })

if (!process.env.AUTH_DATABASE_URL) {
  throw new Error('AUTH_DATABASE_URL environment variable is required.')
}

const connectionString = process.env.AUTH_DATABASE_URL
const client = postgres(connectionString, { max: 1 })

// Export the Drizzle instance connected to the auth DB and using the auth schema
export const authDb = drizzle(client, { schema })
```

**3. `src/db/auth-schema.ts`:**
Initially, this file can be empty or contain a placeholder. We will populate it using the Better Auth CLI output.

```typescript
// src/db/auth-schema.ts
// We will populate this file with schema definitions generated by Better Auth CLI
import { pgTable, text, timestamp, primaryKey } from 'drizzle-orm/pg-core'

// Placeholder - will be replaced/augmented by Better Auth generate command output
export const exampleAuthTable = pgTable('example_auth', {
  id: text('id').primaryKey(),
})
```

**4. Run Better Auth CLI Generate:**
Execute the command to generate the Drizzle schema definitions needed by Better Auth.

```bash
npx @better-auth/cli generate --adapter=drizzle --dialect=postgresql
```

_Note: Review the CLI options if needed; the exact command might vary slightly._

**Action:** Copy the Drizzle table definitions (`pgTable(...)`) printed to the console by the command above and paste them into your `src/db/auth-schema.ts` file, replacing or adding to any placeholder content. Ensure all necessary imports from `drizzle-orm/pg-core` are present.

**5. Update `package.json`:**
Add scripts for managing auth migrations separately.

```json
{
  "scripts": {
    // ... existing scripts
    "db:auth:generate": "bun drizzle-kit generate --config=drizzle.config.auth.ts",
    "db:auth:migrate": "bun drizzle-kit migrate --config=drizzle.config.auth.ts",
    "db:auth:studio": "bun drizzle-kit studio --config=drizzle.config.auth.ts"
    // Add push/drop scripts if needed
  }
}
```

**6. Generate and Apply Migrations:**
Run the new scripts.

```bash
# Generate the SQL migration file based on auth-schema.ts
bun run db:auth:generate

# Apply the migration to the auth database
bun run db:auth:migrate
```

**Stop and Test:**

1.  Check the `./drizzle/auth` directory for generated migration files (`.sql`).
2.  Run `bun run db:auth:migrate`. Verify it completes successfully.
3.  Connect to the auth database (`localhost:5431`) using a DB client.
4.  Confirm that the tables defined by Better Auth (e.g., `users`, `sessions`, `authenticators`, etc.) have been created.
5.  Optionally run `bun run db:auth:studio` to explore the auth database schema via Drizzle Studio.

---

## Step 4: Better Auth Configuration

**Goal:** Initialize the Better Auth server instance, configured with the Drizzle adapter for the auth database.

**File to Create:** `src/lib/auth.ts`

**Changes:**
Create the Better Auth instance, configure the adapter, and enable desired authentication methods.

```typescript
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle' // Ensure adapter path is correct
import { authDb } from '@/db/auth-db' // Import the Drizzle client for the AUTH database
import * as authSchema from '@/db/auth-schema' // Import the auth schema
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const requiredEnvVars = [
  'AUTH_DATABASE_URL',
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
]

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  basePath: '/api/auth', // Default, matches our API route setup
  // Configure the database adapter
  database: drizzleAdapter(authDb, {
    // Pass the auth Drizzle instance
    schema: authSchema, // Pass the auth schema tables
    provider: 'postgresql', // Specify the database provider type
  }),
  // Define server URL (used for constructing callback URLs etc.)
  serverConfig: {
    origin: process.env.BETTER_AUTH_URL!,
  },
  // Enable Email and Password authentication
  emailAndPassword: {
    enabled: true,
    // sendVerificationEmail: true, // Optional: Require email verification (needs email setup)
    // autoSignIn: true, // Optional: Sign in user automatically after successful signup (default: true)
  },
  // Example: Enable GitHub Social Login (requires env vars)
  // socialProviders: {
  //   github: {
  //     clientId: process.env.GITHUB_CLIENT_ID!,
  //     clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  //   },
  // },
  // Add plugins here if needed later
  // plugins: [],
})

// Export types for convenience if needed elsewhere
export type Auth = typeof auth
```

**Stop and Test:**

1.  Run your application's build process (e.g., `bun build` or similar) to check for type errors or import issues in the new `src/lib/auth.ts` file.
2.  No runtime test available yet, but ensuring it compiles is a good check.

---

## Step 5: API Route Handlers

**Goal:** Create the API route in TanStack Start to handle all authentication requests (`/api/auth/*`).

**File to Create:** `src/routes/api/auth/$.tsx` (or `.ts` if preferred)
_(Adjust path based on your project structure, e.g., `app/routes/...`)_

**Changes:**
Use `createAPIFileRoute` and delegate `GET` and `POST` requests to the Better Auth handler.

```typescript
// src/routes/api/auth/$.tsx

import { createAPIFileRoute } from '@tanstack/react-start/api'
import { auth } from '@/lib/auth' // Import your configured Better Auth instance

// This route handles all requests under /api/auth/*
export const APIFileRoute = createAPIFileRoute('/api/auth/$')({
  // Handle GET requests (e.g., for social auth redirects, session fetching)
  GET: ({ request }) => {
    return auth.handler(request)
  },
  // Handle POST requests (e.g., for email/password sign-in/sign-up)
  POST: ({ request }) => {
    return auth.handler(request)
  },
})
```

**Stop and Test:**

1.  Start your development server (e.g., `bun dev`).
2.  Try navigating to a non-existent auth endpoint in your browser, like `http://localhost:3000/api/auth/test`. You should get a 404 or a specific error response from the Better Auth handler (not just the framework's default 404), indicating the handler is catching the route. _The exact response may vary._
3.  Check the server logs for any errors related to the API route setup.

---

## Step 6: Client-Side Integration

**Goal:** Set up the Better Auth client for use in your React components.

**File to Create:** `src/lib/auth-client.ts`

**Changes:**
Initialize the client, potentially configuring the base URL if your API is on a different origin (though likely not needed if served from the same domain).

```typescript
import { createAuthClient } from 'better-auth/react' // Use the React-specific client

// Initialize the client.
// If your client and server (API routes) are on the same domain,
// baseURL is often not needed. If they differ, specify the server's base URL.
export const authClient = createAuthClient({
  // baseURL: 'http://localhost:3000', // Usually optional for same-domain setups
  // Add client plugins here if needed later
  // plugins: [],
})

// Optionally, re-export specific methods for cleaner imports in components
export const {
  signIn,
  signUp,
  signOut,
  getSession,
  useSession, // React hook for session management
  // ... other methods/hooks provided by the client
} = authClient

// Example of exporting the whole client if preferred
// export { authClient };
```

**Stop and Test:**

1.  Ensure your application builds/compiles without errors related to this new file.
2.  No direct runtime test yet, but this prepares for UI integration.

---

## Step 7: UI Components & Session Management

**Goal:** Create basic Login/Signup forms and display user session status.

**Files to Create/Modify:**

- Create components like `src/components/LoginForm.tsx`, `src/components/SignupForm.tsx`.
- Modify layout or page components (e.g., `src/routes/__root.tsx` or specific pages) to display auth status and forms.

**Changes (Conceptual Examples):**

**1. `src/components/SignupForm.tsx`:**

```typescript
import React, { useState } from 'react';
import { signUp } from '@/lib/auth-client'; // Import the specific function

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Optional: Collect name
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const { error: signUpError } = await signUp.email({
      email,
      password,
      name, // Include name if collected
      callbackURL: '/dashboard', // Redirect after signup/verification
    }, {
      onError: (ctx) => setError(ctx.error.message),
      onSuccess: () => setMessage('Signup successful! Check email if verification needed.'),
    });
    // Note: Error might also be handled by onError callback
    if (signUpError) setError(signUpError.message);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <div>
        <label>Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
      </div>
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

**2. `src/components/LoginForm.tsx`:** (Similar structure using `signIn.email`)

```typescript
import React, { useState } from 'react';
import { signIn } from '@/lib/auth-client';
import { useRouter } from '@tanstack/react-router'; // For redirection

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error: signInError } = await signIn.email({
      email,
      password,
      callbackURL: '/dashboard', // Redirect after successful login
    }, {
      onError: (ctx) => setError(ctx.error.message),
      onSuccess: () => router.invalidate().then(() => router.navigate({ to: '/dashboard'})), // Invalidate router cache and navigate
    });
     if (signInError) setError(signInError.message);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <div>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <button type="submit">Login</button>
    </form>
  );
}
```

**3. Displaying Session & Logout (`src/routes/__root.tsx` or similar layout):**

```typescript
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { useSession, signOut } from '@/lib/auth-client'; // Use the hook

export const Route = createRootRoute({
  component: RootComponent,
  // Optionally load session data here if needed server-side or universally
  // loader: async () => {
  //   // This requires handling headers correctly if run server-side
  //   // For client-side only, useSession hook is easier
  // }
});

function RootComponent() {
  const { data: session, status } = useSession(); // Get session state

  const handleSignOut = async () => {
    await signOut({ callbackURL: '/' }); // Redirect to home after signout
  };

  return (
    <>
      <header>
        <h1>My App</h1>
        <nav>
          {/* Navigation Links */}
          {status === 'loading' && <span>Loading...</span>}
          {status === 'authenticated' && (
            <>
              <span>Welcome, {session.user?.name || session.user?.email}!</span>
              <button onClick={handleSignOut}>Sign Out</button>
              {/* Link to Dashboard */}
            </>
          )}
          {status === 'unauthenticated' && (
            <>
              {/* Link to Login / Signup */}
            </>
          )}
        </nav>
      </header>
      <hr />
      <Outlet /> {/* Renders the matched child route */}
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
```

**Stop and Test:**

1.  Place the `LoginForm` and `SignupForm` components on appropriate pages (e.g., `/login`, `/signup`).
2.  Modify your root layout or relevant components to use the `useSession` hook and display conditional UI based on authentication status (loading, authenticated, unauthenticated). Add the Sign Out button.
3.  **Test Signup:** Go to your signup page, fill in the form, and submit.
    - Check for success/error messages.
    - Check the auth database (`users` table) to see if the user was created.
    - If `autoSignIn` is true (default), you should now see the "authenticated" state in your layout.
    - If email verification is enabled (and configured), check for the verification email.
4.  **Test Logout:** If logged in, click the Sign Out button. Verify you are redirected and the UI updates to the "unauthenticated" state.
5.  **Test Login:** Go to the login page, enter the credentials of the user you signed up, and submit.
    - Check for success/error messages.
    - Verify you are redirected (e.g., to `/dashboard`) and the UI shows the "authenticated" state.
    - Check browser developer tools (Application -> Cookies) for session cookies set by Better Auth.
6.  Test invalid login attempts.

---

## Step 8: Testing (Refinement)

**Goal:** Perform more thorough end-to-end testing.

**Actions:**

- Test password requirements (minimum length).
- If using social login, test that flow.
- Test accessing protected routes/pages when logged out (should redirect or deny access).
- Test accessing protected routes/pages when logged in (should allow access).
- Check console logs (client and server) for any errors during the auth flows.
- Verify session persistence after closing and reopening the browser (if `rememberMe` is used, usually default).

---

## Step 9: Production Considerations

**Goal:** Prepare for deployment.

**Actions (Review and Plan):**

- Ensure `BETTER_AUTH_SECRET` is strong and securely managed in your production environment (not committed to Git).
- Configure environment variables (`AUTH_DATABASE_URL`, `BETTER_AUTH_URL`, social keys) correctly for production.
- Set up database backups for the `postgres-auth` database.
- Review Better Auth documentation for security features like rate limiting, password hashing options, or security-related plugins if needed.
- Consider enabling HTTPS for your application.

---

This guide provides a comprehensive walkthrough. Remember to adapt file paths and specific code details to your exact project setup. Good luck!
