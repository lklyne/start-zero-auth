# Implementation Plan: Reactive Zero Initialization via AuthAwareZeroProvider

This plan outlines the steps to make the Zero instance reactive to authentication changes using `better-auth`'s `useSession` hook and a dedicated provider component, while preserving the previous route-based pre-loading logic via comments for historical reference.

**Goals:**

1.  Initialize/Re-initialize Zero instance whenever the user's authentication state changes.
2.  Use `better-auth`'s `useSession` as the trigger for auth state changes.
3.  Modify `initZero` to accept auth details directly, avoiding redundant fetches.
4.  Encapsulate Zero lifecycle management within a new `AuthAwareZeroProvider` component.
5.  Use the official `@rocicorp/zero/react`'s `ZeroProvider` internally.
6.  Integrate this provider high in the component tree (e.g., in `__root.tsx`).
7.  Disable the old pre-loading mechanism in `src/routes/app/route.tsx` by commenting it out.
8.  Clean up related router context definitions.

**Steps:**

**Step 1: Modify `initZero` Function**

- **File:** `src/lib/zero.tsx`
- **Action:** Refactor `initZero` to accept authentication details (e.g., the JWT) as an argument instead of fetching it internally.
  - Change the function signature, e.g., `initZero(options: { jwt: string | null }): Promise<Zero>`.
  - Remove the internal `fetchAuthData` function call within `initZero`.
  - Use the passed `options.jwt` to determine the `userId` (e.g., decode JWT or use 'guest') and to provide the token to the `Zero` constructor's `auth` callback logic if needed (or just use the `userId`).
  - Ensure the `auth` callback within `new Zero({...})` uses the _initially provided_ `jwt` for its _first_ attempt, rather than re-fetching immediately.

**Step 2: Create `AuthAwareZeroProvider` Component**

- **File:** `src/lib/AuthAwareZeroProvider.tsx` (Create this new file)
- **Action:** Implement the component responsible for listening to auth changes and managing the Zero instance.

  ```typescript
  import { Zero } from '@rocicorp/zero';
  import { ZeroProvider } from '@rocicorp/zero/react';
  import React, { useState, useEffect, useMemo } from 'react';
  import { authClient } from '@/lib/auth-client'; // Adjust import if needed
  import { initZero } from '@/lib/zero'; // Your modified initZero

  interface AuthAwareZeroProviderProps {
    children: React.ReactNode;
  }

  export function AuthAwareZeroProvider({ children }: AuthAwareZeroProviderProps) {
    const { data: session, isPending: isSessionPending } = authClient.useSession();
    const [currentZeroInstance, setCurrentZeroInstance] = useState<Zero | null>(null);
    const [isInitializing, setIsInitializing] = useState(true); // Track initialization state

    useEffect(() => {
      // Avoid initializing if session is still loading initially, unless we want a guest instance immediately
      if (isSessionPending && !currentZeroInstance) {
           console.log('⏸️ Session pending, waiting to initialize Zero...');
           setIsInitializing(true);
           return;
      }

      let instanceToClose: Zero | null = null;
      let didCancel = false;
      setIsInitializing(true); // Start initialization

      const initialize = async () => {
        // Extract JWT from session - **ADJUST based on actual session structure**
        const jwt = session?.token ?? null; // Example: Replace 'token' with the actual field name
        console.log(`🔑 Initializing Zero with JWT: ${jwt ? 'Present' : 'Absent'}`);

        try {
          const newZeroInstance = await initZero({ jwt }); // Pass auth details
          if (!didCancel) {
            console.log('✅ Zero instance successfully initialized/updated.');
            instanceToClose = currentZeroInstance; // Store old instance for cleanup *after* state update
            setCurrentZeroInstance(newZeroInstance);
          }
        } catch (error) {
          console.error("❌ Failed to initialize Zero:", error);
          if (!didCancel) {
            instanceToClose = currentZeroInstance;
            setCurrentZeroInstance(null); // Set to null on error
          }
        } finally {
           if (!didCancel) {
              setIsInitializing(false); // Mark initialization complete (success or fail)
           }
           // Close the *previous* instance *after* the new state is set
           if (instanceToClose) {
             console.log('🧹 Closing previous Zero instance...');
             // Wait a tick to ensure React state update has propagated before closing
             setTimeout(() => {
                 instanceToClose?.close().catch(err => console.error("Error closing Zero:", err));
             }, 0);
           }
        }
      };

      initialize();

      return () => {
        didCancel = true;
        setIsInitializing(false); // Ensure loading state is reset if effect is cancelled
        // Cleanup of the *current* instance happens before the *next* instance is set, or on unmount.
      };
      // **IMPORTANT**: Adjust dependency array based on the specific fields in `session` that indicate an auth change (e.g., user ID, token presence). `session` object itself might work if it changes identity.
    }, [session, isSessionPending]); // Re-run when session changes or pending status resolves

    // Optional: Render a loading state while initializing
    if (isInitializing && !currentZeroInstance) {
        return <div>Loading Session & Zero...</div>; // Or a better loading indicator
    }

    // Use the library's provider, passing the managed instance
    return (
      <ZeroProvider zero={currentZeroInstance}>
        {children}
      </ZeroProvider>
    );
  }
  ```

**Step 3: Integrate `AuthAwareZeroProvider` into Root**

- **File:** `src/routes/__root.tsx`
- **Action:** Wrap the main application content area (`<Outlet />` within `RootDocument`) with the new `AuthAwareZeroProvider`.

  - Import `AuthAwareZeroProvider` from `@/lib/AuthAwareZeroProvider`.
  - Modify `RootDocument` component:

    ```diff
     import { AuthAwareZeroProvider } from '@/lib/AuthAwareZeroProvider';
     // ... other imports

     function RootDocument({ children }: { children: React.ReactNode }) {
         return (
             <html lang='en'>
                 <head>
                     <HeadContent />
                 </head>
                 <body>
    +                    <AuthAwareZeroProvider>
                          {children}
    +                    </AuthAwareZeroProvider>
                     <Scripts />
                 </body>
             </html>
         )
     }
    ```

  - Make sure the children passed to `RootDocument` (which includes `<Outlet />`) are placed _inside_ `AuthAwareZeroProvider`.

**Step 4: Deactivate Old Pre-loading in `/app` Route**

- **File:** `src/routes/app/route.tsx`
- **Action:** Comment out the code related to the previous Zero initialization method.
  - Comment out the entire `context` function definition within `createFileRoute('/app')({...})`.
  - Comment out the entire `loader` function definition.
  - In the `RouteComponent` function:
    - Comment out the line `const { z: zeroPromise } = useRouteContext({ from: '/app' })`.
    - Comment out the line `const z = use(zeroPromise)`.
    - Remove the `<ZeroProvider zero={z}>` wrapper around the component's return value. The component should now simply return its JSX (e.g., `<div>...<Outlet />...</div>`).

**Step 5: Clean Up Router Context Definitions**

- **File:** `src/routes/__root.tsx`
  - **Action:** Remove the `z: ReturnType<typeof initZero> | undefined` property from the `MyRouterContext` interface definition.
- **File:** `src/router.tsx`
  - **Action:** Remove the `z: undefined` property from the `context` object passed to `createTanstackRouter`.

**Step 6: Verification**

- Run the application (`npm run dev` or similar).
- Test logging in and logging out. Observe the console logs from `AuthAwareZeroProvider` to confirm Zero is re-initializing.
- Ensure components that use `useZero` function correctly both when logged in and logged out (guest state), receiving the `Zero` instance (or `null`) from the provider.
- Verify that the `/app` route and its children render without errors related to the removed context/loader logic.
