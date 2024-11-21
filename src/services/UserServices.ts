/** @notice Library imports */
import { count, eq } from "drizzle-orm";
/// local imports
import { database } from "@/config/database";
import { NewUserParams, users } from "@/schemas";
import { CredentialService } from "@/services/CredentialServices";

/// User table handler.
export class UsersServices {
  constructor(private credentialService: CredentialService) {}

  /**
   * @dev Creates a brand new user.
   * @param {NewUserParams} data The new user params.
   */
  async create(data: NewUserParams) {
    const hashedPassword = this.credentialService.hashPassword(data.password);
    const [result] = await database
      .insert(users)
      .values({
        ...data,
        password: hashedPassword,
      })
      .returning();
    return result;
  }

  /**
   * @dev Finds an user based on id.
   * @param {string} id The user id wants to find.
   * @returns User or null.
   */
  async findById(id: string) {
    return database.query.users.findFirst({ where: eq(users.id, id) });
  }

  /**
   * @dev Finds an user based on email.
   * @param {string} email The user email wants to find.
   * @returns User or null.
   */
  async findByEmail(email: string) {
    return database.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  /**
   * @dev Counts the number of users available.
   * @returns The number of users.
   */
  async noOfUsers() {
    const [data] = await database.select({ count: count() }).from(users);
    return data.count;
  }
}
