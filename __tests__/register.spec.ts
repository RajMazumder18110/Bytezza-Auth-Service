/** @notice library imports */
import { execSync } from "child_process";
import { testClient } from "hono/testing";
import { StatusCodes } from "http-status-codes";
/// Local imports
import { clearDatabase } from "@/utils";
import { NewUserParams } from "@/database";
import { usersRouter } from "@/routers/userRouter";
import { postgresClient } from "@/config/database";
import { UsersRepository } from "@/database/users/repository";
import { ValidationErrorResponse } from "@/types/responses";
import { CredentialService } from "@/services/CredentialServices";

/// Creates a test app client.
const usersApp = testClient(usersRouter);

describe("User Registration", () => {
  /// Instances
  let userReo: UsersRepository;
  let credService: CredentialService;

  beforeAll(async () => {
    credService = new CredentialService();
    userReo = new UsersRepository(credService);

    /// Migrate database
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
});
