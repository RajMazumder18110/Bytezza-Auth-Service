/** @notice library imports */
import { createId } from "@paralleldrive/cuid2";
import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
/// Local imports
import { timestamps } from "../common";
import { UserRoles } from "@/constants";

/// Core User table
export const users = pgTable(
  "users",
  {
    /// Core fields
    id: text().$defaultFn(createId),
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

/// Types
export type User = typeof users.$inferSelect;
export type NewUserParams = Pick<User, "email" | "password" | "name">;
