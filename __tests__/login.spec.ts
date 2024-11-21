/** @notice library imports */
import { execSync } from "child_process";
import { testClient } from "hono/testing";
import { StatusCodes } from "http-status-codes";
/// Local imports
import { Cookies } from "@/constants";
import { NewUserParams } from "@/schemas";
import { AuthTokenServices } from "@/services";
import { usersRouter } from "@/routers/userRouter";
import { postgresClient } from "@/config/database";
import { clearDatabase, isValidCookies } from "./utils";
import { ValidationErrorResponse } from "@/types/responses";

/// Creates a test app client.
const usersApp = testClient(usersRouter);

describe("User authentication", () => {
  let authTokenRepo: AuthTokenServices;

  /// User data
  const newUserParams: NewUserParams = {
    name: "Raj Mazumder",
    password: "it is secret",
    email: "rajmazumder@test.com",
  };

  beforeAll(async () => {
    authTokenRepo = new AuthTokenServices();

    /// Migrate database
    execSync("bun run generate:certs");
    execSync("NODE_ENV=test bun run db:push");
  });

  beforeEach(async () => {
    await clearDatabase();
    /// Register a user
    await usersApp.register.$post({
      json: newUserParams,
    });
  });

  afterAll(async () => {
    await postgresClient.end();
  });

  describe("[200] - Successful authentication", () => {
    it("Should return a 200 successful response.", async () => {
      const response = await usersApp.login.$post({
        json: {
          ...newUserParams,
          name: undefined,
        },
      });

      expect(response.status).toBe(StatusCodes.OK);
    });

    it("Should return a proper formatted json response.", async () => {
      const response = await usersApp.login.$post({
        json: {
          ...newUserParams,
          name: undefined,
        },
      });

      const data = await response.json();
      expect(response.headers.get("content-type")).toStrictEqual(
        expect.stringContaining("json"),
      );
      expect(data).toHaveProperty("success");
      expect(data).toHaveProperty("message");
      expect(data.success).toBeTruthy();
      expect(data.message).toStrictEqual("User logged in successfully");
    });

    it("Should return cookies includes access & refresh token.", async () => {
      const response = await usersApp.login.$post({
        json: {
          ...newUserParams,
          name: undefined,
        },
      });

      const cookies = response.headers.get("Set-Cookie");
      expect(cookies).not.toBeNull();
      expect(cookies).toStrictEqual(
        expect.stringContaining(Cookies.ACCESS_TOKEN),
      );
      expect(cookies).toStrictEqual(
        expect.stringContaining(Cookies.REFRESH_TOKEN),
      );
      expect(isValidCookies(cookies!)).toBeTruthy();
    });

    it("Should persist refresh token into database.", async () => {
      await usersApp.login.$post({
        json: {
          ...newUserParams,
          name: undefined,
        },
      });

      const count = await authTokenRepo.noOfTokens();
      expect(count).toBe(2);
    });
  });

  describe("[400] - Invalid form values", () => {
    it("Should return 400 response when no parameters are passed.", async () => {
      const response = await usersApp.login.$post({
        json: {},
      });

      const data =
        (await response.json()) as unknown as ValidationErrorResponse;

      expect(data).toHaveProperty("success");
      expect(data).toHaveProperty("message");
      expect(data).toHaveProperty("code");

      expect(data.success).toBeFalsy();
      expect(data.issues).toHaveLength(2);
      expect(data.code).toStrictEqual("VALIDATION_ERROR");
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(data.message).toStrictEqual("Invalid parameters!");
    });

    it("Should return 400 response when email not passed.", async () => {
      const response = await usersApp.login.$post({
        json: {
          ...newUserParams,
          name: undefined,
          email: undefined,
        },
      });

      const data =
        (await response.json()) as unknown as ValidationErrorResponse;

      expect(data.success).toBeFalsy();
      expect(data.issues).toHaveLength(1);
      expect(data.code).toStrictEqual("VALIDATION_ERROR");
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it("Should return 400 response when 'email' is invalid.", async () => {
      const response = await usersApp.login.$post({
        json: {
          ...newUserParams,
          name: undefined,
          email: "nice@",
        },
      });

      const data =
        (await response.json()) as unknown as ValidationErrorResponse;

      expect(data.success).toBeFalsy();
      expect(data.issues).toHaveLength(1);
      expect(data.code).toStrictEqual("VALIDATION_ERROR");
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it("Should return 400 response when password not passed.", async () => {
      const response = await usersApp.login.$post({
        json: {
          ...newUserParams,
          password: undefined,
        },
      });

      const data =
        (await response.json()) as unknown as ValidationErrorResponse;

      expect(data.success).toBeFalsy();
      expect(data.issues).toHaveLength(1);
      expect(data.code).toStrictEqual("VALIDATION_ERROR");
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it("Should return 400 response when password less than 6 characters.", async () => {
      const response = await usersApp.login.$post({
        json: {
          ...newUserParams,
          password: "cool",
        },
      });

      const data =
        (await response.json()) as unknown as ValidationErrorResponse;

      expect(data.success).toBeFalsy();
      expect(data.issues).toHaveLength(1);
      expect(data.code).toStrictEqual("VALIDATION_ERROR");
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });
  });

  describe("[400] - Non registered user", () => {
    it("Should return 400 response when email id not registered.", async () => {
      const response = await usersApp.login.$post({
        json: {
          ...newUserParams,
          email: "cool@test.com",
        },
      });

      const data = await response.text();
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(data).toStrictEqual(
        expect.stringContaining("Invalid email or password!"),
      );
    });

    it("Should return 400 response when invalid password.", async () => {
      const response = await usersApp.login.$post({
        json: {
          ...newUserParams,
          password: "cool@test.com",
        },
      });

      const data = await response.text();
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(data).toStrictEqual(
        expect.stringContaining("Invalid email or password!"),
      );
    });
  });
});
