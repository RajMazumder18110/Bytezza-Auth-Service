/** @notice library imports */
import { timestamp } from "drizzle-orm/pg-core";

/// Timestamps
export const timestamps = {
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .$onUpdate(() => new Date()),
};
