/** @notice local imports */
import { users } from "@/schemas";
import { database } from "@/config/database";

export const clearDatabase = async () => {
  await database.delete(users);
};

export const extractTokens = (cookie: string) => {
  const allCookies = cookie.split(", ");
  const tokens = allCookies.reduce((prevCkie: string[], ckie) => {
    const cookieExtracted = ckie.split(";")[0];
    return [...prevCkie, cookieExtracted];
  }, []);

  return tokens.join("; ");
};

export const isValidCookies = (cookie: string): boolean => {
  const allCookies = cookie.split(", ");
  for (const ckie of allCookies) {
    const actualCookie = ckie.split(";")[0].split("=")[1];
    const parts = actualCookie.split(".");

    if (parts.length !== 3) return false;
    return parts.every((part) => Buffer.from(part, "base64"));
  }

  return false;
};
