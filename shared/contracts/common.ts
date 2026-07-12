/** Shared API/transport primitives. Keep wire-format naming as-is. */

export type ApiMessage = {
  message: string;
};

export type SessionRequestStatus = "pending" | "approved" | "rejected";

export type UserType = "mentor" | "mentee" | string;

/** Authenticated request user as attached by backend auth middleware. */
export type AuthUser = {
  userId: string;
  userType: UserType;
  email?: string;
};

/** Standard service envelope used by most backend service functions. */
export type ApiResult<T> = {
  status: number;
  body: T;
};
