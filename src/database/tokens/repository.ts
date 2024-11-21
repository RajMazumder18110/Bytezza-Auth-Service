/** @notice Library imports */
import { count, eq } from "drizzle-orm";
/// local imports
import { database } from "@/config/database";
import { authTokens, NewAuthToken } from "./schema";

/// User table handler.
export class AuthTokenRepository {
  async create(data: NewAuthToken) {
    const [result] = await database.insert(authTokens).values(data).returning({
      id: authTokens.id,
    });
    return result.id;
  }

  async isValidAuthTokenId(id: string) {
    const token = await database.query.authTokens.findFirst({
      where: eq(authTokens.id, id),
    });
    return token !== undefined;
  }

  async noOfTokens() {
    const [data] = await database.select({ count: count() }).from(authTokens);
    return data.count;
  }

  async revokeAllTokensOfUserId(userId: string) {
    await database
      .update(authTokens)
      .set({
        isActive: false,
      })
      .where(eq(authTokens.userId, userId));
  }

  async revokeAllTokensId(tokenId: string) {
    await database
      .update(authTokens)
      .set({
        isActive: false,
      })
      .where(eq(authTokens.id, tokenId));
  }
}
