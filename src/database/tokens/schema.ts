/** @notice library imports */
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { boolean, pgTable, text } from "drizzle-orm/pg-core";
/// Local imports
import { users } from "@/database";
import { timestamps } from "../common";

/// Core tokens table
export const authTokens = pgTable("tokens", {
  /// Core fields
  id: text().primaryKey().$defaultFn(createId),
  isActive: boolean().notNull().default(true),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  /// Timestamps
  ...timestamps,
});

/// Relations
export const authTokenRelations = relations(authTokens, ({ one }) => ({
  user: one(users, {
    references: [users.id],
    fields: [authTokens.userId],
  }),
}));

/// Types
export type AuthToken = typeof authTokens.$inferSelect;
export type NewAuthToken = Pick<AuthToken, "userId">;
