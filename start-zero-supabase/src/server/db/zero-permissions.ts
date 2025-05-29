import { schema as zeroSchema } from '@/server/db/zero-schema.gen'
import type { Schema } from '@/server/db/zero-schema.gen'
// https://github.com/BriefHQ/drizzle-zero
import {
	ANYONE_CAN,
	type ExpressionBuilder,
	type InsertValue,
	type PermissionsConfig,
	type Row,
	// type Schema,
	definePermissions,
} from '@rocicorp/zero'
// import * as drizzleSchema from './schema'

// AuthData is the JWT sub claim plus the users row (email & name)
export type AuthData = { sub: User['id'] | null } & Partial<
	Pick<User, 'email' | 'name'>
>

// Must export `schema`
export const schema = zeroSchema

// Define permissions with explicit types
export type ZeroSchema = Schema

export type Person = Row<typeof zeroSchema.tables.persons>
export type User = Row<typeof zeroSchema.tables.users>
export type InsertPerson = InsertValue<typeof zeroSchema.tables.persons>
export type InsertUser = InsertValue<typeof zeroSchema.tables.users>
export const permissions = definePermissions<AuthData, Schema>(
	zeroSchema,
	() => {
		const allowIfLoggedIn = (
			authData: AuthData,
			{ cmpLit }: ExpressionBuilder<Schema, 'persons'>,
		) => cmpLit(authData.sub, 'IS NOT', null)

		const allowIfSelf = (
			authData: AuthData,
			{ cmp }: ExpressionBuilder<Schema, 'users'>,
		) => cmp('id', authData.sub as string)

		return {
			persons: {
				row: {
					select: ANYONE_CAN,
					insert: ANYONE_CAN,
					delete: [allowIfLoggedIn],
				},
			},
			users: {
				row: {
					select: ANYONE_CAN,
					insert: ANYONE_CAN,
					delete: [allowIfSelf],
				},
			},
		} satisfies PermissionsConfig<AuthData, Schema>
	},
)
