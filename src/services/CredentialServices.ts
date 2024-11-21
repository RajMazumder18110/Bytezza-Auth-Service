/** @notice library imports */
import { compareSync, hashSync } from "bcrypt";

export class CredentialService {
  private saltRounds = 10;

  hashPassword(password: string) {
    return hashSync(password, this.saltRounds);
  }

  isSamePassword(password: string, hashedPassword: string) {
    return compareSync(password, hashedPassword);
  }
}
