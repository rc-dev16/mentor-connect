import { type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PasswordSignInFormProps = {
  email: string;
  password: string;
  isLoading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function PasswordSignInForm({
  email,
  password,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: PasswordSignInFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <Input
        type="email"
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        placeholder="Email"
        autoComplete="email"
        required
      />
      <Input
        type="password"
        value={password}
        onChange={(event) => onPasswordChange(event.target.value)}
        placeholder="Password"
        autoComplete="current-password"
        required
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign in with password"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        First-time users should use email code, then set a password.
      </p>
    </form>
  );
}
