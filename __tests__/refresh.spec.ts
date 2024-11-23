/** @notice library imports */
import { execSync } from "child_process";
import { testClient } from "hono/testing";
import { StatusCodes } from "http-status-codes";
/// Local imports
import { usersRouter } from "@/routers/userRouter";
import { postgresClient } from "@/config/database";
import { clearDatabase, extractTokens } from "./utils";

/// Creates a test app client.
const usersApp = testClient(usersRouter);

describe("Refresh tokens", () => {
  let cookies: string;

  /// User data
  const loginUserParams = {
    password: "it is secret",
    email: "rajmazumder@test.com",
  };

  beforeAll(async () => {
    /// Migrate database
    execSync("bun run generate:certs");
    execSync("NODE_ENV=test bun run db:push");
  });

  beforeEach(async () => {
    await clearDatabase();
    /// Register a user
    await usersApp.register.$post({
      json: {
        ...loginUserParams,
        name: "Raj Mazumder",
      },
    });

    /// login the created user
    const response = await usersApp.login.$post({
      json: loginUserParams,
    });
    const rawCookies = response.headers.get("Set-Cookie")!;
    cookies = extractTokens(rawCookies);
  });

  afterAll(async () => {
    await postgresClient.end();
  });

  describe("[200] - Successful logout", () => {
    it("Should return a 200 successful response on successful token refresh.", async () => {
      const response = await usersApp.refresh.$post(
        {},
        {
          headers: {
            Cookie: cookies,
          },
        },
      );
      expect(response.status).toBe(StatusCodes.OK);
    });

    it("Should return a proper formatted json response.", async () => {
      const response = await usersApp.refresh.$post(
        {},
        {
          headers: {
            Cookie: cookies,
          },
        },
      );

      const data = await response.json();
      expect(response.headers.get("content-type")).toStrictEqual(
        expect.stringContaining("json"),
      );
      expect(data).toHaveProperty("success");
      expect(data).toHaveProperty("message");
      expect(data.success).toBeTruthy();
      expect(data.message).toStrictEqual("Token successfully refreshed!");
    });

    it("Should contain a fresh set-cookie header.", async () => {
      const response = await usersApp.refresh.$post(
        {},
        {
          headers: {
            Cookie: cookies,
          },
        },
      );

      const rawCookies = response.headers.get("Set-Cookie")!;
      const allCookies = extractTokens(rawCookies);
      expect(allCookies).not.toBe(cookies);
    });
  });

  describe("[401] - Cookies not available or invalid", () => {
    it("Should return 401 response when request does not have cookies.", async () => {
      const response = await usersApp.refresh.$post({});

      const data = await response.text();
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(data).toStrictEqual(expect.stringContaining("Unauthorized"));
    });

    it("Should return 401 response when cookies are invalid.", async () => {
      const response = await usersApp.refresh.$post(
        {},
        {
          headers: {
            Cookie: "ACCESS_TOKEN=cool",
          },
        },
      );

      const data = await response.text();
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(data).toStrictEqual(expect.stringContaining("Unauthorized"));
    });

    it("Should return 401 response when user refresh tokens with revoked token.", async () => {
      await usersApp.refresh.$post(
        {},
        {
          headers: {
            Cookie: cookies,
          },
        },
      );

      const response = await usersApp.refresh.$post(
        {},
        {
          headers: {
            Cookie: cookies, /// old cookie
          },
        },
      );

      const data = await response.text();
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(data).toStrictEqual(expect.stringContaining("Unauthorized"));
    });
  });
});
