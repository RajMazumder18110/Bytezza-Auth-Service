const API_PREFIX = "/api";

export const enum ApplicationRoutes {
  AUTH = `${API_PREFIX}/auth`,
}
export const enum AuthRoutes {
  LOGIN = "/login",
  WHO_AM_I = "/whoami",
  REGISTER = "/register",
  LOGOUT = "/logout",
  REFRESH = "/refresh",
}
