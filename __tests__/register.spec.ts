/** @notice library imports */
import { testClient } from "hono/testing";
import { StatusCodes } from "http-status-codes";
/// Local imports
import { NewUserParams } from "@/database";
import { usersRouter } from "@/routers/userRouter";
import { UsersRepository } from "@/database/users/repository";
import { postgresClient } from "@/config/database";
import { execSync } from "child_process";

/// Creates a test app client.
const usersApp = testClient(usersRouter);

describe("Authentication", () => {
  /// Instances
  let userReo: UsersRepository;

  beforeAll(async () => {
    userReo = new UsersRepository();

    /// Migrate database
    execSync("NODE_ENV=test bun run db:push");
  });

  afterAll(async () => {
    await postgresClient.end();
  });

  describe("/register", () => {
    /// User data
    const newUserParams: NewUserParams = {
      name: "Raj Mazumder",
      password: "it is secret",
      email: "rajmazumder@test.com",
    };

    describe("[POST] - 201", () => {
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
    });
  });
});
