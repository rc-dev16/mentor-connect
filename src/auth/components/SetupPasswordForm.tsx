import { type FormEvent, useState } from "react";
import { useUser } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/auth/services/auth-api";
import { getClerkError } from "@/auth/hooks/useClerkSignIn";

export function SetupPasswordForm() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useUser();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Enter the same password in both fields.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password is too short",
        description: "Use at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (!isLoaded || !isSignedIn) {
        throw new Error("No active Clerk session found.");
      }
      await authApi.completePasswordSetup(password);
      const session = await authApi.getAuthSession();
      navigate(session.role === "mentor" ? "/mentor/dashboard" : "/dashboard", { replace: true });
    } catch (error) {
      toast({
        title: "Could not set password",
        description: getClerkError(error, "Password setup failed."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="New password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <Input
        type="password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        placeholder="Confirm password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Set password"}
      </Button>
    </form>
  );
}
