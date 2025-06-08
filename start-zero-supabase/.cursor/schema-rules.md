# Schema Update Rules

## Overview
This project uses Drizzle ORM with Zero Sync for real-time data synchronization. Schema changes require careful coordination between the database schema, Zero schema configuration, and application code.

## Core Workflow: Expand-Migrate-Contract Pattern

### 1. EXPAND Phase (Add new columns safely)
- Add new columns to `src/server/db/schema.ts`
- Set new columns to `false` in `drizzle-zero.config.ts`
- New columns should be nullable or have defaults
- Generate and run migration

### 2. MIGRATE Phase (Deploy application changes)
- Update application code to use new columns
- Test thoroughly in development
- Deploy application changes

### 3. CONTRACT Phase (Enable in Zero schema)
- Change column from `false` to `true` in `drizzle-zero.config.ts`
- Regenerate Zero schema with `bun db:zero:generate`
- Test real-time sync functionality

## Required Commands for Schema Changes

```bash
# 1. Generate migration after schema changes
bun db:generate

# 2. Apply migration to database
bun db:migrate

# 3. Regenerate Zero schema (after enabling columns)
bun db:zero:generate

# 4. Optional: Reset and reseed database
bun db:seed
```

## File Dependencies

### Primary Schema Files
- `src/server/db/schema.ts` - Drizzle schema definitions
- `drizzle-zero.config.ts` - Zero sync configuration
- `src/server/db/zero-schema.gen.ts` - Generated Zero schema (auto-generated)

### Migration Files
- `src/server/db/drizzle/` - Drizzle migration files
- `supabase/seed.sql` - Database seed data

## Rules for Schema Changes

### Adding New Columns
1. Always add columns as nullable or with defaults
2. Set to `false` in `drizzle-zero.config.ts` initially
3. Generate migration with `bun db:generate`
4. Run migration with `bun db:migrate`
5. Update application code to handle new column
6. Enable in Zero config and regenerate schema

### Removing Columns
1. First set column to `false` in `drizzle-zero.config.ts`
2. Regenerate Zero schema
3. Update application code to stop using column
4. Deploy changes
5. Remove column from Drizzle schema
6. Generate and run migration

### Renaming Columns
1. Add new column with new name
2. Update application code to write to both columns
3. Migrate data from old to new column
4. Update application code to read from new column only
5. Remove old column

### Adding New Tables
1. Add table to `src/server/db/schema.ts`
2. Add table configuration to `drizzle-zero.config.ts`
3. Set initial columns as needed (true/false)
4. Generate migration and Zero schema

## Testing Schema Changes

### Local Development
```bash
# Start Supabase locally
bun supabase:start

# Reset database with seed data
bun db:seed

# Check database status
bun supabase:status
```

### Validation Checklist
- [ ] Migration generates without errors
- [ ] Migration applies successfully
- [ ] Zero schema regenerates without errors
- [ ] Application builds successfully
- [ ] Real-time sync works for new/modified data
- [ ] Existing data remains accessible

## Common Pitfalls

### DON'T
- Add required columns without defaults to existing tables
- Enable new columns in Zero config before migration
- Forget to regenerate Zero schema after config changes
- Skip the expand-migrate-contract pattern
- Remove columns before updating application code

### DO
- Always use nullable columns or defaults for new fields
- Follow the three-phase deployment pattern
- Test migrations in development first
- Keep Zero config and schema in sync
- Document schema changes in commit messages

## Emergency Rollback

If schema changes cause issues:

```bash
# Rollback last migration
bun db:migrate --rollback

# Reset to known good state
bun db:seed

# Regenerate Zero schema
bun db:zero:generate
```

## Code Quality

- Run `bun check` before committing schema changes
- Ensure TypeScript compilation passes
- Test real-time functionality after schema changes
- Update seed data if needed for new columns