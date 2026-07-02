import { type FormEvent, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { EmailOtpForm } from "@/auth/components/EmailOtpForm";
import { PasswordSignInForm } from "@/auth/components/PasswordSignInForm";
import { getClerkError, useClerkSignIn } from "@/auth/hooks/useClerkSignIn";

type LoginMode = "otp" | "password";
type OtpStep = "email" | "code";

const Login = () => {
  const { sendEmailCode, verifyEmailCode, signInWithPassword } = useClerkSignIn();
  const { toast } = useToast();
  const [mode, setMode] = useState<LoginMode>("otp");
  const [otpStep, setOtpStep] = useState<OtpStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailCodeStart = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await sendEmailCode(email);
      setOtpStep("code");
      toast({
        title: "Code sent",
        description: "Check your email for the Mentor-Connect sign-in code.",
      });
    } catch (error) {
      toast({
        title: "Could not send code",
        description: getClerkError(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailCodeVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await verifyEmailCode(code);
    } catch (error) {
      toast({
        title: "Invalid code",
        description: getClerkError(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await signInWithPassword(email, password);
    } catch (error) {
      toast({
        title: "Password sign in failed",
        description: getClerkError(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-0 bg-cover bg-center bg-no-repeat bg-fixed" 
      style={{ 
        backgroundImage: 'url(/bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="w-full flex justify-center px-4 md:px-8 lg:px-12">
        <Card className="w-full max-w-3xl py-6">
          <CardHeader className="space-y-2 text-center">
            <div className="flex items-center justify-center mb-6 gap-3">
              <img src="/mm.png" alt="Mentor-Connect Logo" className="h-16 w-auto" />
              <h1 className="text-2xl font-black text-primary uppercase tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Mentor-Connect</h1>
            </div>
            <CardTitle className="text-2xl font-bold">Sign in with your email</CardTitle>
            <CardDescription>
              Use email OTP first, then set a password for future sign-ins
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 pb-8">
            <div className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-lg border bg-background p-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={mode === "otp" ? "default" : "outline"}
                  onClick={() => {
                    setMode("otp");
                    setOtpStep("email");
                  }}
                >
                  Email code
                </Button>
                <Button
                  type="button"
                  variant={mode === "password" ? "default" : "outline"}
                  onClick={() => setMode("password")}
                >
                  Password
                </Button>
              </div>

              {mode === "otp" && (
                <EmailOtpForm
                  email={email}
                  code={code}
                  otpStep={otpStep}
                  isLoading={isLoading}
                  onEmailChange={setEmail}
                  onCodeChange={setCode}
                  onSendCode={handleEmailCodeStart}
                  onVerifyCode={handleEmailCodeVerify}
                  onUseDifferentEmail={() => setOtpStep("email")}
                />
              )}

              {mode === "password" && (
                <PasswordSignInForm
                  email={email}
                  password={password}
                  isLoading={isLoading}
                  onEmailChange={setEmail}
                  onPasswordChange={setPassword}
                  onSubmit={handlePasswordLogin}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;