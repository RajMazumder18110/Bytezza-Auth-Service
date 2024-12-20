/** @notice library imports */
import { execSync } from "child_process";
import { testClient } from "hono/testing";
import { StatusCodes } from "http-status-codes";
/// Local imports
import { NewUserParams } from "@/schemas";
import { Cookies, UserRoles } from "@/constants";
import { usersRouter } from "@/routers/userRouter";
import { postgresClient } from "@/config/database";
import { clearDatabase, isValidCookies } from "./utils";
import { ValidationErrorResponse } from "@/types/responses";
import {
  CredentialService,
  AuthTokenServices,
  UsersServices,
} from "@/services";

/// Creates a test app client.
const usersApp = testClient(usersRouter);

describe("User Registration", () => {
  /// Instances
  let userReo: UsersServices;
  let credService: CredentialService;
  let authTokenRepo: AuthTokenServices;

  beforeAll(async () => {
    credService = new CredentialService();
    authTokenRepo = new AuthTokenServices();
    userReo = new UsersServices(credService);

    /// Migrate database
    execSync("bun run generate:certs");
    execSync("NODE_ENV=test bun run db:push");
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await postgresClient.end();
  });

  /// User data
  const newUserParams: NewUserParams = {
    name: "Raj Mazumder",
    password: "it is secret",
    email: "rajmazumder@test.com",
  };

  describe("[201] - Successful registration", () => {
    it("Should return a 201 created response.", async () => {
      const response = await usersApp.register.$post({
        json: newUserParams,
      });

      expect(response.status).toBe(StatusCodes.CREATED);
    });

    it("Should return a proper formatted json response.", async () => {
      const response = await usersApp.register.$post({
        json: newUserParams,
      });

      const data = await response.json();
      expect(response.headers.get("content-type")).toStrictEqual(
        expect.stringContaining("json"),
      );
      expect(data).toHaveProperty("success");
      expect(data).toHaveProperty("message");
      expect(data.success).toBeTruthy();
      expect(data.message).toStrictEqual("User created successfully");
    });

    it("Should save registered user role as 'CUSTOMER'.", async () => {
      await usersApp.register.$post({
        json: newUserParams,
      });

      const user = await userReo.findByEmail(newUserParams.email);
      expect(user?.role).toBe(UserRoles.CUSTOMER);
    });

    it("Should create one user into the database.", async () => {
      await usersApp.register.$post({
        json: newUserParams,
      });

      const count = await userReo.noOfUsers();
      expect(count).toBe(1);
    });

    it("Should save password as hashed password.", async () => {
      await usersApp.register.$post({
        json: newUserParams,
      });

      const user = await userReo.findByEmail(newUserParams.email);
      expect(user?.password).not.toBe(newUserParams.password);
      expect(user?.password).toHaveLength(60);
      expect(user?.password).toMatch(/^\$2b\$\d+\$/);
    });

    it("Should return cookies includes access & refresh token.", async () => {
      const response = await usersApp.register.$post({
        json: newUserParams,
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
      await usersApp.register.$post({
        json: newUserParams,
      });

      const count = await authTokenRepo.noOfTokens();
      expect(count).toBe(1);
    });
  });

  describe("[400] - Invalid form values", () => {
    it("Should return 400 response when no parameters are passed.", async () => {
      const response = await usersApp.register.$post({
        json: {},
      });

      const data =
        (await response.json()) as unknown as ValidationErrorResponse;

      expect(data).toHaveProperty("success");
      expect(data).toHaveProperty("message");
      expect(data).toHaveProperty("code");

      expect(data.success).toBeFalsy();
      expect(data.issues).toHaveLength(3);
      expect(data.code).toStrictEqual("VALIDATION_ERROR");
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(data.message).toStrictEqual("Invalid parameters!");
    });

    it("Should return 400 response when name not passed.", async () => {
      const response = await usersApp.register.$post({
        json: {
          ...newUserParams,
          name: undefined,
        },
      });

      const data =
        (await response.json()) as unknown as ValidationErrorResponse;

      expect(data.success).toBeFalsy();
      expect(data.issues).toHaveLength(1);
      expect(data.code).toStrictEqual("VALIDATION_ERROR");
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it("Should return 400 response when 'name' length <3 .", async () => {
      const response = await usersApp.register.$post({
        json: {
          ...newUserParams,
          name: "OK",
        },
      });

      const data =
        (await response.json()) as unknown as ValidationErrorResponse;

      expect(data.success).toBeFalsy();
      expect(data.issues).toHaveLength(1);
      expect(data.code).toStrictEqual("VALIDATION_ERROR");
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it("Should return 400 response when email not passed.", async () => {
      const response = await usersApp.register.$post({
        json: {
          ...newUserParams,
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
      const response = await usersApp.register.$post({
        json: {
          ...newUserParams,
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
      const response = await usersApp.register.$post({
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
  });

  describe("[406] - Non unique email", () => {
    it("Should return Conflict error as email is not unique.", async () => {
      await usersApp.register.$post({
        json: newUserParams,
      });

      const response = await usersApp.register.$post({
        json: newUserParams,
      });
      expect(response.status).toBe(StatusCodes.CONFLICT);
    });
  });
});
