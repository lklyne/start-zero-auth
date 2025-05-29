# Offline-First Implementation Plan

## Problem Statement

Currently, the app fails to navigate between routes when offline due to authentication checks requiring network connectivity, despite Zero Sync already caching the data for offline use.

## Goals

1. Enable full offline navigation between routes
2. Maintain security by still validating tokens when online
3. Minimize code changes and complexity
4. Leverage existing Zero cache capabilities

## Implementation Overview

### Phase 1: Optimize Authentication Flow

The primary issue is in the authentication validation during navigation. We need to modify the auth flow to prioritize cached tokens when offline.

#### 1. Modify `_authed.tsx` Loader

```typescript
// src/routes/_authed.tsx
export const Route = createFileRoute('/_authed')({
  ssr: true,
  loader: async ({ location }) => {
    // First check for cached JWT
    const cachedJwt = getCachedJwt()
    if (cachedJwt) {
      const decoded = decodeAuthJwt(cachedJwt)
      // If we have a token and it's not expired (or we're offline), use it
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine
      const now = Math.floor(Date.now() / 1000)

      if (decoded && (isOffline || decoded.exp > now)) {
        return { session: { jwt: cachedJwt, user: decoded } }
      }
    }

    // Only call server if previous check failed
    try {
      const { session } = await fetchAuthSession()
      if (!session) {
        throw redirect({
          to: '/auth/login',
          search: { redirect: location.href },
        })
      }
      return { session }
    } catch (error) {
      // If network error but we have a cached token, use it even if expired
      if (cachedJwt && typeof navigator !== 'undefined' && !navigator.onLine) {
        const decoded = decodeAuthJwt(cachedJwt)
        if (decoded) {
          return { session: { jwt: cachedJwt, user: decoded } }
        }
      }
      throw redirect({ to: '/auth/login', search: { redirect: location.href } })
    }
  },
  // Rest of the component remains unchanged
})
```

#### 2. Enhance JWT Storage with Offline Grace Periods

Create a new file `src/server/auth/extended-jwt.ts`:

```typescript
import {
  storeJwt,
  getCachedJwt as getOriginalCachedJwt,
  decodeAuthJwt,
  clearJwt,
} from '@/server/auth/jwt'
import type { AuthData } from '@/server/db/zero-permissions'

// Store JWT with offline-friendly metadata
export function storeExtendedJwt(jwt: string): void {
  storeJwt(jwt)
  const decoded = decodeAuthJwt(jwt)
  if (decoded) {
    localStorage.setItem(
      'auth-jwt-offline-last-validated',
      Date.now().toString(),
    )
  }
}

// Get JWT with offline fallback logic
export function getExtendedCachedJwt(): string | null {
  const jwt = getOriginalCachedJwt()
  if (!jwt) return null

  const decoded = decodeAuthJwt(jwt)
  if (!decoded) return null

  const now = Math.floor(Date.now() / 1000)
  const isOnline = typeof navigator !== 'undefined' && navigator.onLine

  // If online and not expired, it's valid
  if (isOnline && decoded.exp > now) {
    return jwt
  }

  // If offline, check when we last validated with server
  if (!isOnline) {
    // Allow using the token offline even if technically expired
    return jwt
  }

  return null
}

// Re-export other JWT functions
export { decodeAuthJwt, clearJwt }
```

#### 3. Update the AuthWrapper Component

Modify `AuthWrapper` in `_authed.tsx` to use the enhanced JWT functions:

```typescript
// Import the enhanced JWT functions
import { getExtendedCachedJwt, storeExtendedJwt, decodeAuthJwt } from '@/server/auth/extended-jwt'

function AuthWrapper() {
  useEffect(() => {
    const cached = getExtendedCachedJwt()
    if (cached) {
      const decoded = decodeAuthJwt(cached)
      if (decoded) {
        setAuthAtom(cached, decoded)
      }
    }

    // Only fetch a new JWT if online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      fetchAuthJwt().then(({ jwt }) => {
        if (jwt) {
          storeExtendedJwt(jwt) // Use enhanced storage
          const decoded = decodeAuthJwt(jwt)
          if (decoded) {
            setAuthAtom(jwt, decoded)
          }
        }
      }).catch(err => {
        console.warn('Failed to fetch auth JWT, using cached version if available', err)
      })
    }
  }, [])

  return <Outlet />
}
```

### Phase 2 (Optional): TanStack Query Integration

If you want to further optimize with TanStack Query, add these changes:

#### 1. Create Auth Query Hook

Create a new file `src/hooks/use-auth-query.ts`:

```typescript
import { fetchAuthSession } from '@/server/auth/session'
import { fetchAuthJwt } from '@/server/auth/jwt'
import {
  getExtendedCachedJwt,
  decodeAuthJwt,
  storeExtendedJwt,
} from '@/server/auth/extended-jwt'
import { useQuery } from '@tanstack/react-query'

export function useAuthQuery() {
  return useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      // Try to fetch from server
      const { session } = await fetchAuthSession()
      if (session) {
        const { jwt } = await fetchAuthJwt()
        if (jwt) {
          storeExtendedJwt(jwt)
          return { session, jwt }
        }
      }
      throw new Error('Authentication failed')
    },
    networkMode: 'offlineFirst',
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: false,
    // Fallback to cached if offline
    placeholderData: () => {
      const cachedJwt = getExtendedCachedJwt()
      if (cachedJwt) {
        const decoded = decodeAuthJwt(cachedJwt)
        if (decoded) {
          return {
            session: { user: decoded },
            jwt: cachedJwt,
          }
        }
      }
      return undefined
    },
  })
}
```

#### 2. Configure TanStack Query Client

Create `src/lib/query-client.ts`:

```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
})
```

#### 3. Add Network Status Indicator (Optional)

Create a simple component to show offline status:

```typescript
// src/components/network-status.tsx
import { useEffect, useState } from 'react'

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed bottom-4 right-4 py-1 px-3 bg-yellow-500 text-black text-sm rounded-full shadow-md">
      Offline Mode
    </div>
  )
}
```

## Implementation Steps

1. **First Implementation (Minimal):**

   - Modify `_authed.tsx` loader to prioritize cached JWT
   - Create extended JWT helper functions
   - Update AuthWrapper to handle offline scenarios

2. **Optional Enhancements:**
   - Implement TanStack Query for auth state
   - Add offline status indicator
   - Add service workers (only if needed for caching other resources)

## Testing Plan

1. Test navigation while online (baseline)
2. Test navigation after going offline (should work with cached auth)
3. Test navigation after token expiration while offline (should still work)
4. Test data mutations while offline (should use Zero local cache)
5. Test synchronization when coming back online
