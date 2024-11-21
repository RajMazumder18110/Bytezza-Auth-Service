/** @notice library imports */
import { Context } from "hono";
import { setCookie } from "hono/cookie";
import { sign } from "jsonwebtoken";
/// Local imports
import { Cookies } from "@/constants";
import { Environments } from "@/config";
import { CredentialService } from "./CredentialServices";

export class CookieServices {
  constructor(private credentialService: CredentialService) {}

  assignRefreshToken(c: Context, userId: string) {
    /// Generating token
    const token = sign(
      {
        userId,
      },
      Environments.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1y",
        algorithm: "HS256",
        issuer: "BytezzaAuthService",
      },
    );

    /// Assign cookie
    setCookie(c, Cookies.REFRESH_TOKEN, token, {
      secure: true,
      httpOnly: true,
      sameSite: "Strict",
      domain: "localhost",
      maxAge: 60 * 60 * 24 * 365, // 1y
    });
  }

  assignAccessToken(c: Context, userId: string) {
    /// Get private
    const privateKey = this.credentialService.getPrivateKey();

    /// Generating token
    const token = sign(
      {
        userId,
      },
      privateKey,
      {
        expiresIn: "1d",
        algorithm: "RS256",
        issuer: "BytezzaAuthService",
      },
    );

    /// Assign cookie
    setCookie(c, Cookies.ACCESS_TOKEN, token, {
      httpOnly: true,
      sameSite: "Strict",
      domain: "localhost",
      maxAge: 60 * 60 * 24, // 1d
    });
  }
}
