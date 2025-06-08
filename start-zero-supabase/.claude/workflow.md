# Claude Workflow Documentation

## Project Context
This is a Start Zero Auth template with Supabase backend and Zero Sync for real-time data synchronization. The project uses:
- **Frontend**: React with TanStack Router and TanStack Start
- **Backend**: Supabase PostgreSQL
- **ORM**: Drizzle ORM
- **Real-time**: Zero Sync
- **Styling**: Tailwind CSS + shadcn/ui
- **Package Manager**: Bun

## Key Commands Reference

### Development
```bash
bun dev                     # Start development server
bun build                   # Build for production
bun check                   # Run Biome linter/formatter
```

### Database Operations
```bash
bun supabase:start         # Start local Supabase
bun supabase:stop          # Stop local Supabase  
bun supabase:reset         # Reset database
bun db:generate            # Generate Drizzle migration
bun db:migrate             # Apply migration to database
bun db:push                # Push schema changes (dev only)
bun db:seed                # Reset and seed database
bun db:zero:generate       # Generate Zero schema
```

### Zero Cache
```bash
bun zero-cache             # Start Zero cache development server
```

## Schema Update Workflow

When updating database schemas, always follow the **Expand-Migrate-Contract** pattern:

### 1. Expand Phase
```bash
# 1. Add column to src/server/db/schema.ts (nullable/default)
# 2. Set column to false in drizzle-zero.config.ts
# 3. Generate and apply migration
bun db:generate
bun db:migrate
```

### 2. Migrate Phase
```bash
# 4. Update application code to use new column
# 5. Test thoroughly
# 6. Deploy application changes
```

### 3. Contract Phase
```bash
# 7. Enable column in drizzle-zero.config.ts (false → true)
# 8. Regenerate Zero schema
bun db:zero:generate
# 9. Test real-time functionality
```

## File Structure Guide

### Schema Files
- `src/server/db/schema.ts` - Drizzle schema definitions
- `drizzle-zero.config.ts` - Zero sync table/column configuration
- `src/server/db/zero-schema.gen.ts` - Auto-generated Zero schema

### Key Application Files
- `src/routes/_authed/app/_layout/zero-mutations.tsx` - Example Zero mutations
- `src/lib/zero-client-mutators.ts` - Client-side Zero operations
- `src/server/db/zero-server-mutators.ts` - Server-side Zero operations

### Configuration
- `drizzle.config.ts` - Drizzle configuration
- `supabase/config.toml` - Supabase local configuration
- `biome.json` - Code formatting/linting rules

## Common Tasks

### Adding a New Table
1. Define table in `src/server/db/schema.ts`
2. Add table config to `drizzle-zero.config.ts`
3. Generate migration: `bun db:generate`
4. Apply migration: `bun db:migrate`
5. Generate Zero schema: `bun db:zero:generate`

### Adding a New Column
1. Add column to table in `src/server/db/schema.ts` (nullable!)
2. Set column to `false` in `drizzle-zero.config.ts`
3. Generate migration: `bun db:generate`
4. Apply migration: `bun db:migrate`
5. Update application code
6. Enable in Zero config and regenerate schema

### Testing Changes
```bash
# Reset environment for clean testing
bun supabase:reset
bun db:seed
bun db:zero:generate

# Check everything works
bun dev
# Test in browser, especially real-time features
```

## Troubleshooting

### Migration Issues
```bash
# Check migration status
bun db:studio

# Rollback if needed
bun db:migrate --rollback

# Reset database
bun db:seed
```

### Zero Sync Issues
```bash
# Regenerate Zero schema
bun db:zero:generate

# Check Zero cache is running
bun zero-cache

# Verify config matches schema
# Check drizzle-zero.config.ts vs src/server/db/schema.ts
```

### Build Issues
```bash
# Clean and rebuild
bun check
bun build

# Check TypeScript errors
npx tsc --noEmit
```

## Development Workflow

1. **Start Services**
   ```bash
   bun supabase:start
   bun zero-cache    # In separate terminal
   bun dev          # In separate terminal
   ```

2. **Make Changes**
   - Follow schema update rules for database changes
   - Use `bun check` frequently during development
   - Test real-time features after Zero schema changes

3. **Before Committing**
   ```bash
   bun check        # Lint and format
   bun build        # Ensure build works
   # Test app functionality
   ```

## Notes for Claude
- Always run `bun check` after making code changes
- Use the expand-migrate-contract pattern for all schema changes
- When adding columns, start with `false` in drizzle-zero.config.ts
- Test real-time sync after enabling columns in Zero config
- Prefer editing existing files over creating new ones
- Check existing patterns before implementing new features