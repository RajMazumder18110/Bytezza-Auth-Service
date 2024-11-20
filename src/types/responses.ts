export type SuccessResponse<T extends Record<string, string>> = {
  data?: T;
  success: true;
  message?: string;
};

export type ErrorResponse = {
  success: false;
  message?: string;
  code: "VALIDATION_ERROR" | "NOT_FOUND" | "SERVER_ERROR" | "HTTP_ERROR";
};

export type ErrorNotFoundResponse = ErrorResponse & {
  path: string;
  success: false;
  code: "NOT_FOUND";
};

export type ValidationErrorResponse = ErrorResponse & {
  issues: {
    field: string;
    message: string;
  }[];
  success: false;
  code: "VALIDATION_ERROR";
};
