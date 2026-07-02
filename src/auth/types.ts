export type UserRole = "mentor" | "mentee";

export type AuthSession = {
  user: {
    id: string;
    email: string;
    name: string;
    user_type: UserRole;
  };
  role: UserRole;
  requiresPasswordSetup: boolean;
};

export type AuthError = {
  code?: string;
  message: string;
};

export function isUserRole(role: unknown): role is UserRole {
  return role === "mentor" || role === "mentee";
}
