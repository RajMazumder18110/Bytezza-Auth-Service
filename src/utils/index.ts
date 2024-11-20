/** @notice local imports */
import { users } from "@/database";
import { database } from "@/config/database";

export const clearDatabase = async () => {
  await database.delete(users);
};
