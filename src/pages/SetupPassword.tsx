import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SetupPasswordForm } from "@/auth/components/SetupPasswordForm";

const SetupPassword = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4"
      style={{ backgroundImage: "url(/bg.png)" }}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Set your password</CardTitle>
          <CardDescription>
            Create a password so you can use password sign-in after your first email-code login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SetupPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupPassword;
