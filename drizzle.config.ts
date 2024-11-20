/** @notice library imports */
import { defineConfig } from "drizzle-kit";
/// Local imports
import {
  Environments,
  DATABASE_MIGRATIONS_PATH,
} from "./src/config/environments";

export default defineConfig({
  dialect: "postgresql",
  out: DATABASE_MIGRATIONS_PATH,
  schema: "./src/database/index.ts",
  dbCredentials: {
    url: Environments.POSTGRES_DATABASE_URL,
  },
});
