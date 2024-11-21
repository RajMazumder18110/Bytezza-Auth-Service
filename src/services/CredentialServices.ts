/** @notice library imports */
import { resolve } from "path";
import { readFileSync } from "fs";
import { compareSync, hashSync } from "bcrypt";

export class CredentialService {
  private saltRounds = 10;

  hashPassword(password: string) {
    return hashSync(password, this.saltRounds);
  }

  isSamePassword(password: string, hashedPassword: string) {
    return compareSync(password, hashedPassword);
  }

  getPrivateKey() {
    /// Reading privatekey
    const privateKey = readFileSync(
      resolve(process.cwd(), "certs/private.pem"),
    );
    return privateKey;
  }

  getPublicKey() {
    /// Reading publicKey
    const publicKey = readFileSync(resolve(process.cwd(), "certs/public.pem"));
    return publicKey;
  }
}
