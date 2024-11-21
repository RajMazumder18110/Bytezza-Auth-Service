/** @notice library imports */
import { timestamp } from "drizzle-orm/pg-core";

/// Timestamps
export const timestamps = {
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().$onUpdate(() => new Date()),
};
