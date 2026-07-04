import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usePasswordActions, type PasswordFormMode } from "@/auth/hooks/usePasswordActions";
import {
  validatePasswordChangeInput,
  validatePasswordSetupInput,
} from "@/auth/lib/password-validation";

type PasswordFormProps = {
  mode: PasswordFormMode;
};

export function PasswordForm({ mode }: PasswordFormProps) {
  const { toast } = useToast();
  const { setupPassword, changePassword } = usePasswordActions();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validation =
      mode === "setup"
        ? validatePasswordSetupInput({ newPassword, confirmPassword })
        : validatePasswordChangeInput({ currentPassword, newPassword, confirmPassword });

    if (!validation.ok) {
      toast({
        title: "Invalid password",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "setup") {
        await setupPassword(newPassword);
        toast({
          title: "Password set",
          description: "You can now sign in with your email and password.",
        });
      } else {
        await changePassword(currentPassword, newPassword);
        toast({
          title: "Password updated",
          description: "Use your new password the next time you sign in.",
        });
      }
      resetFields();
    } catch (error) {
      toast({
        title: mode === "setup" ? "Could not set password" : "Could not update password",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "change" && (
        <div className="space-y-1.5">
          <Label htmlFor="current-password">Current password</Label>
          <Input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="new-password">{mode === "setup" ? "New password" : "New password"}</Label>
        <Input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirm-password">Confirm password</Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? "Saving..."
          : mode === "setup"
            ? "Set password"
            : "Update password"}
      </Button>
    </form>
  );
}
