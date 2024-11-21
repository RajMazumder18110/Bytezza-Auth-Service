/** @notice library imports */
import { Context } from "hono";
import { sign } from "hono/jwt";
import { setCookie } from "hono/cookie";
/// Local imports
import { Environments } from "@/config";
import { Cookies, UserRoles } from "@/constants";
import { CredentialService } from "./CredentialServices";

export class CookieServices {
  constructor(private credentialService: CredentialService) {}

  async assignRefreshToken(
    c: Context,
    payload: { id: string; role: UserRoles },
  ) {
    /// refresh token age
    const age = 60 * 60 * 24 * 365; // 1y

    /// Generating token
    const token = await sign(
      {
        ...payload,
        exp: age,
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
        exp: age,
      },
      privateKey,
      "RS256",
    );

    /// Assign cookie
    setCookie(c, Cookies.ACCESS_TOKEN, token, {
      maxAge: age,
      httpOnly: true,
      sameSite: "Strict",
      domain: "localhost",
    });
  }
}
