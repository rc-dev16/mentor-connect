import { SignIn } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Login = () => {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat bg-fixed" 
      style={{ 
        backgroundImage: 'url(/bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="w-full max-w-6xl flex justify-start">
        <Card className="w-full max-w-3xl">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-6">
              <img src="/logo.png" alt="Logo" className="h-16 w-auto" />
            </div>
            <CardTitle className="text-2xl font-bold">Sign in with your university email</CardTitle>
            <CardDescription>
              OTP-only on first login. Set a password after you’re in.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Login policy</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use your institution email (mentors: @jaipur.manipal.edu).</li>
                <li>Clerk sends an email code / magic link (no password required).</li>
                <li>After first login, set a password from Settings for stronger auth.</li>
              </ul>
            </div>
            <SignIn
              path="/login"
              routing="path"
              afterSignInUrl="/"
              afterSignUpUrl="/"
              signUpFallbackRedirectUrl="/"
              signInFallbackRedirectUrl="/"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border bg-background",
                  headerTitle: "text-lg",
                },
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;