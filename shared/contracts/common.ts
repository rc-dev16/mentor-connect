/** Shared API/transport primitives. Keep wire-format naming as-is. */

export type ApiMessage = {
  message: string;
};

export type SessionRequestStatus = "pending" | "approved" | "rejected";

export type UserType = "mentor" | "mentee" | string;
