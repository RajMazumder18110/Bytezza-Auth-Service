/** @notice library imports */
import { grabEnv } from "@rajmazumder/grabenv";

/// Interface of Env
interface IEnvironments {
  PORT?: number;

  /// Database ///
  REFRESH_TOKEN_SECRET: string;
  POSTGRES_DATABASE_URL: string;
}

/// Environments
export const Environments = grabEnv<IEnvironments>({
  PORT: {
    type: "number",
    defaultValue: 3000,
  },

  /// Database ///
  POSTGRES_DATABASE_URL: {
    type: "string",
  },
  REFRESH_TOKEN_SECRET: {
    type: "string",
  },
});

export const DATABASE_MIGRATIONS_PATH = "./migrations";
export const isInTesting = Environments.NODE_ENV === "test";
export const isInDevelopment = Environments.NODE_ENV === "development";
