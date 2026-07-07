import { Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PasswordForm } from "@/auth/components/PasswordForm";

type SecuritySettingsCardProps = {
  requiresPasswordSetup: boolean;
};

export function SecuritySettingsCard({ requiresPasswordSetup }: SecuritySettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          Security
        </CardTitle>
        <CardDescription>Manage your password and security settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {requiresPasswordSetup
            ? "Create a password so you can sign in with email and password next time."
            : "Update your password below. You will need your current password."}
        </p>
        <PasswordForm mode={requiresPasswordSetup ? "setup" : "change"} />
      </CardContent>
    </Card>
  );
}
