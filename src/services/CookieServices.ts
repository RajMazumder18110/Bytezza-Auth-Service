/** @notice library imports */
import { Context } from "hono";
import { sign, verify } from "hono/jwt";
import { JWTPayload } from "hono/utils/jwt/types";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
/// Local imports
import { Environments } from "@/config";
import { unauthorized } from "@/errors";
import { AuthVariables } from "@/types/variables";
import { Cookies, UserRoles } from "@/constants";
import { CredentialService } from "./CredentialServices";

export class CookieServices {
  constructor(private credentialService: CredentialService) {}

  async assignRefreshToken(
    c: Context,
    data: { tokenId: string; userId: string },
  ) {
    /// refresh token age
    const age = 60 * 60 * 24 * 365; // 1y

    /// Generating token
    const token = await sign(
      {
        exp: new Date().getTime() + age,
        id: data.tokenId,
        uid: data.userId,
      },
      Environments.REFRESH_TOKEN_SECRET,
      "HS256",
    );

    /// Assign cookie
    setCookie(c, Cookies.REFRESH_TOKEN, token, {
      maxAge: age,
      secure: true,
      httpOnly: true,
      sameSite: "Strict",
      domain: "localhost",
    });
  }

  async validateRefreshToken(c: Context) {
    /// Grabbing access token
    const token = getCookie(c, Cookies.REFRESH_TOKEN);
    if (!token) throw unauthorized;
    return (await verify(
      token,
      Environments.REFRESH_TOKEN_SECRET,
      "HS256",
    )) as JWTPayload & {
      id: string;
      uid: string;
    };
  }

  async assignAccessToken(
    c: Context,
    payload: { id: string; role: UserRoles },
  ) {
    /// access token age
    const age = 60 * 60 * 24; // 1d

    /// Get private
    const privateKey = this.credentialService.getPrivateKey();

    /// Generating token
    const token = await sign(
      {
        ...payload,
        exp: new Date().getTime() + age,
      },
      privateKey,
      "RS256",
    );

    /// Assign cookie
    setCookie(c, Cookies.ACCESS_TOKEN, token, {
      maxAge: age,
      secure: true,
      httpOnly: true,
      sameSite: "Strict",
      domain: "localhost",
    });
  }

  async validateAccessToken(
    c: Context,
  ): Promise<JWTPayload & AuthVariables["auth"]> {
    /// Grabbing access token
    const token = getCookie(c, Cookies.ACCESS_TOKEN);
    if (!token) throw unauthorized;

    try {
      return (await verify(
        token,
        this.credentialService.getPrivateKey(),
        "RS256",
      )) as JWTPayload & AuthVariables["auth"];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      throw unauthorized;
    }
  }

  invalidateAllTokens(c: Context) {
    deleteCookie(c, Cookies.ACCESS_TOKEN);
    deleteCookie(c, Cookies.REFRESH_TOKEN);
  }
}
