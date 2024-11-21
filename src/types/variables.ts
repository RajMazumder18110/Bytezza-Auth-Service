/** @notice library imports */
import { UserRoles } from "@/constants";

export type AuthVariables = {
  auth: {
    id: string;
    role: UserRoles;
  };
};
