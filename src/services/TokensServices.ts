/** @notice Library imports */
import { and, count, eq } from "drizzle-orm";
/// local imports
import { database } from "@/config/database";
import { authTokens, NewAuthToken } from "@/schemas";

/// User table handler.
export class AuthTokenServices {
  async create(data: NewAuthToken) {
    const [result] = await database.insert(authTokens).values(data).returning({
      id: authTokens.id,
    });
    return result.id;
  }

  async isValidAuthTokenId(id: string) {
    const token = await database.query.authTokens.findFirst({
      where: and(eq(authTokens.id, id), eq(authTokens.isActive, true)),
    });
    return token !== undefined;
  }

  async isUsingRevokedAuthTokenId(id: string) {
    const token = await database.query.authTokens.findFirst({
      where: and(eq(authTokens.id, id), eq(authTokens.isActive, false)),
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
      .where(and(eq(authTokens.userId, userId), eq(authTokens.isActive, true)));
  }

  async revokeTokensId(tokenId: string) {
    await database
      .update(authTokens)
      .set({
        isActive: false,
      })
      .where(eq(authTokens.id, tokenId));
  }
}
