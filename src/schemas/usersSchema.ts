/** @notice library imports */
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
/// Local imports
import { timestamps } from "./common";
import { UserRoles } from "@/constants";
import { authTokens } from "./authTokensSchema";

/// Core User table
export const users = pgTable(
  "users",
  {
    /// Core fields
    id: text().primaryKey().$defaultFn(createId),
    name: text().notNull(),
    email: text().notNull(),
    password: text().notNull(),
    role: text({ enum: [UserRoles.CUSTOMERS, UserRoles.ADMIN] })
      .notNull()
      .default(UserRoles.CUSTOMERS),

    /// Timestamps
    ...timestamps,
  },
  (table) => [uniqueIndex("userEmailIdx").on(table.email)],
);

/// Relations
export const userRelations = relations(users, ({ many }) => ({
  tokens: many(authTokens),
}));

/// Types
export type User = typeof users.$inferSelect;
export type NewUserParams = Pick<User, "email" | "password" | "name">;
