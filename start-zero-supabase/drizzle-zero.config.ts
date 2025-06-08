import { drizzleZeroConfig } from "drizzle-zero";
import * as drizzleSchema from "./src/server/db/schema";

// Define your configuration file for the CLI
export default drizzleZeroConfig(drizzleSchema, {
  // Specify which tables and columns to include in the Zero schema.
  // This allows for the "expand/migrate/contract" pattern recommended in the Zero docs.
  // When a column is first added, it should be set to false, and then changed to true
  // once the migration has been run.

  // All tables/columns must be defined, but can be set to false to exclude them from the Zero schema.
  // Column names match your Drizzle schema definitions
  tables: {
    // this can be set to false
    // e.g. user: false,
    users: {
      id: true,
      email: true,
      name: true,
    },
    persons: {
      // or this can be set to false
      // e.g. id: false,
      id: true,
      name: true,
      email: true, // New column - now enabled for Zero sync
    },
  },

  // Specify the casing style to use for the schema.
  // This is useful for when you want to use a different casing style than the default.
  // This works in the same way as the `casing` option in the Drizzle ORM.
  //
  // @example
  // casing: "snake_case",
});