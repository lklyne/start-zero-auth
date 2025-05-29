# Tanstack React Start + Zero Starter

Created with:
`bunx create-tsrouter-app@latest my-app --template file-router --toolchain biome --add-ons shadcn,form,start`

Running the app

```bash
# Start the database
bun db:up

# Push the schema to the database
bun db:push

# Push the auth schema to the database
bun db:auth:push

# Start Zero Cache
bun zero-cache

# Start dev server
bun dev
```

## Stack

- Tanstack Start
- Zero Sync
- Drizzle
- Shadcn
- Biome
- React Email
- Resend

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
