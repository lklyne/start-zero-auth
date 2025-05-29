import { pgTable, varchar } from 'drizzle-orm/pg-core'

export const persons = pgTable('persons', {
	id: varchar('id').primaryKey(),
	name: varchar('name').notNull(),
})

export const users = pgTable('users', {
	id: varchar('id').primaryKey(),
	email: varchar('email').notNull(),
	name: varchar('name').notNull(),
})
