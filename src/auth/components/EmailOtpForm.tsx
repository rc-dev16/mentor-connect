import { type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type EmailOtpFormProps = {
  email: string;
  code: string;
  otpStep: "email" | "code";
  isLoading: boolean;
  onEmailChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onSendCode: (event: FormEvent<HTMLFormElement>) => void;
  onVerifyCode: (event: FormEvent<HTMLFormElement>) => void;
  onUseDifferentEmail: () => void;
};

export function EmailOtpForm({
  email,
  code,
  otpStep,
  isLoading,
  onEmailChange,
  onCodeChange,
  onSendCode,
  onVerifyCode,
  onUseDifferentEmail,
}: EmailOtpFormProps) {
  if (otpStep === "email") {
    return (
      <form onSubmit={onSendCode} className="flex flex-col gap-3">
        <Input
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="Email"
          autoComplete="email"
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Sending code..." : "Send sign-in code"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={onVerifyCode} className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Enter the code sent to <span className="font-medium text-foreground">{email}</span>.
      </p>
      <Input
        inputMode="numeric"
        value={code}
        onChange={(event) => onCodeChange(event.target.value)}
        placeholder="Verification code"
        autoComplete="one-time-code"
        required
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Verifying..." : "Verify code"}
      </Button>
      <Button type="button" variant="ghost" onClick={onUseDifferentEmail}>
        Use a different email
      </Button>
    </form>
  );
}
