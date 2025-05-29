# 🚀 Zero Custom‑Mutators Implementation Plan

This document walks you through setting up custom mutators in your **start-zero** project, using `drizzle-zero` on the server and Zero's built‑in Postgres provider for a fast first pass. Follow each step in order, test as you go, and check off the boxes.

---

## 🔧 Prerequisites

- `@rocicorp/zero@0.18` & `drizzle-zero` installed
- Your schema is defined in `src/db/schema.zero.ts`
- Env vars in `.env` (at least `ZERO_UPSTREAM_DB`, `ZERO_CVR_DB`, `ZERO_CHANGE_DB`, `ZERO_AUTH_JWKS_URL`, `VITE_PUBLIC_SERVER`)
- TanStack Start running via `vinxi start` or `npm run dev`

---

## 1. Create Mutators Directory

In your project root, create:
src/
└── mutators/
├── shared.ts
└── server.ts

### 1.1 `src/mutators/shared.ts`

```ts
// src/mutators/shared.ts
import type { CustomMutatorDefs, CustomMutatorImpl } from '@rocicorp/zero/pg'
import { schema, type AuthData } from '@/db/schema.zero'

/**
 * Define client‐side mutators (optimistic updates + permissions).
 */
export function createMutators(
  authData: AuthData,
): CustomMutatorDefs<typeof schema, unknown> {
  return {
    persons: {
      async insert(tx, args: { id: string; name: string }) {
        // e.g. permission check: only logged‑in users can insert
        if (!authData.sub) throw new Error('Not authenticated')
        await tx.mutate.persons.insert(args)
      },
      async delete(tx, args: { id: string }) {
        if (!authData.sub) throw new Error('Not authenticated')
        await tx.mutate.persons.delete(args)
      },
    },
    // Add more table namespaces & mutators here…
  }
}
```

### 1.2 `src/mutators/server.ts`

```ts
// src/mutators/server.ts
import { createMutators } from './shared'
import { type AuthData } from '@/db/schema.zero'

/**
 * Wrap client mutators, adding any server‑only logic or postCommitTasks.
 */
export function createServerMutators(
  authData: AuthData,
): CustomMutatorDefs<typeof schema, unknown> {
  const clientMutators = createMutators(authData)
  return {
    ...clientMutators,
    // You can override or extend here:
    persons: {
      ...clientMutators.persons,
      // e.g. add audit logging inside the same transaction
      async insert(tx, args) {
        await clientMutators.persons!.insert!(tx, args)
        // server-side-only: await tx.mutate.auditLog.insert({ ... })
      },
    },
  }
}
```

---

## 2. Wire Mutators into Your Client Zero Instance

Open `src/lib/zero.tsx` and:

1. Import your `createMutators` and `AuthData`.
2. Pass `mutators` into the Zero constructor.

```diff
--- a/src/lib/zero.tsx
+++ b/src/lib/zero.tsx
@@  top of file:
 import { Zero } from '@rocicorp/zero'
+import { createMutators, AuthData } from '@/mutators/shared'

 export async function initZero() {
   // … existing code …
   const { jwt } = await fetchAuthData()
   const userId = jwt ? getUserIdFromJwt(jwt) : 'guest'
+  const authData: AuthData = { sub: jwt ? userId : null }

   const zero = new Zero({
     auth: /* … */,
     userID: userId,
     schema: zeroSchema,
     kvStore: import.meta.client ? 'idb' : 'mem',
     server: serverUrl,
-    // no mutators yet
+    mutators: createMutators(authData),
   })
   return zero
 }
```

---

## 3. Create the Push Endpoint

### 3.1. New Route File

Create `src/routes/api/push.ts` with:

```ts
// src/routes/api/push.ts
import { createAPIFileRoute } from '@tanstack/react-start/api'
import postgres from 'postgres'
import { connectionProvider, PushProcessor } from '@rocicorp/zero/pg'
import { zeroSchema } from '@/db/schema.zero'
import { createServerMutators, AuthData } from '@/mutators/server'

export const APIFileRoute = createAPIFileRoute('/api/push')({
  POST: async ({ request }) => {
    // 1) Read query params + body
    const url = new URL(request.url)
    const queryString = url.searchParams.toString()
    const bodyText = await request.text()
    const body = JSON.parse(bodyText)

    // 2) Build Postgres connectionProvider
    const sql = postgres(process.env.ZERO_UPSTREAM_DB!, {
      // Optional: ssl, max, etc.
    })
    const provider = connectionProvider(sql)

    // 3) Instantiate PushProcessor
    const processor = new PushProcessor(zeroSchema, provider)

    // 4) Extract auth (JWT) from header or cookie
    const authHeader = request.headers.get('authorization') ?? ''
    const token = authHeader.replace(/^Bearer\s+/, '')
    const authData: AuthData = { sub: token ? parseSub(token) : null }

    // 5) Call process()
    const result = await processor.process(
      createServerMutators(authData),
      queryString,
      body,
    )

    // 6) Return JSON
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    })
  },
})

/** Helper – decode the `sub` from your JWT token payload */
function parseSub(jwt: string): string | null {
  try {
    const [, payload] = jwt.split('.')
    const data = JSON.parse(atob(payload))
    return data.sub ?? null
  } catch {
    return null
  }
}
```

---

## 4. Smoke‑Test End‑to‑End

1. In your UI (e.g. `/` or `/authed/app`), call a mutator, e.g.
   ```ts
   zero.mutate.persons.insert({ id: crypto.randomUUID(), name: 'Alice' })
   ```
2. Open Network Panel → watch the POST to `/api/push`
3. Verify the row appears in your Postgres `persons` table
4. Try a `delete` mutator and confirm the row is removed

---

## 5. Next Steps

- **Drizzle‑Zero Adapter**: Once the basic flow works, swap in the Drizzle‑Zero connector from your gist for tighter types.
- **Advanced Mutators**: Add more complex custom mutators (e.g. `launchMissiles`) in `shared.ts` + server‑only hooks in `server.ts`.
- **Post‑Commit Tasks**: Collect side‑effects (emails, logs) in an array during your server mutator and flush them after `processor.process`.

---

🎉 You're all set! Follow these steps sequentially, checking off each section as you confirm it works. Happy coding!
