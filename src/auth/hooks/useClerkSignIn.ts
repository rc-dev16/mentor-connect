import { useState } from "react";
import { useClerk } from "@clerk/react";

export type ClerkErrorLike = {
  errors?: Array<{ longMessage?: string; message?: string }>;
  message?: string;
};

type ClerkFactor = {
  strategy?: string;
  emailAddressId?: string;
};

type ClerkSignInAttempt = {
  status?: string;
  createdSessionId?: string;
  supportedFirstFactors?: ClerkFactor[];
  prepareFirstFactor: (params: { strategy: "email_code"; emailAddressId: string }) => Promise<ClerkSignInAttempt>;
  attemptFirstFactor: (params: { strategy: "email_code"; code: string }) => Promise<ClerkSignInAttempt>;
};

type ClerkSignInClient = {
  client: {
    signIn: {
      create: (params: Record<string, unknown>) => Promise<ClerkSignInAttempt>;
    };
  };
  setActive: (params: { session: string }) => Promise<void>;
};

export function getClerkError(error: unknown, fallback = "Sign in failed.") {
  const clerkError = error as ClerkErrorLike;
  return clerkError?.errors?.[0]?.longMessage || clerkError?.errors?.[0]?.message || clerkError?.message || fallback;
}

export function useClerkSignIn() {
  const clerk = useClerk();
  const clerkClient = clerk as unknown as ClerkSignInClient;
  const [pendingSignIn, setPendingSignIn] = useState<ClerkSignInAttempt | null>(null);

  const activateSession = async (signIn: ClerkSignInAttempt) => {
    if (signIn?.status !== "complete" || !signIn?.createdSessionId) {
      throw new Error("Sign in could not be completed.");
    }
    await clerkClient.setActive({ session: signIn.createdSessionId });
    window.location.href = "/login";
  };

  const sendEmailCode = async (email: string) => {
    const signIn = await clerkClient.client.signIn.create({ identifier: email });
    const emailCodeFactor = signIn.supportedFirstFactors?.find((factor) => factor.strategy === "email_code");

    if (!emailCodeFactor?.emailAddressId) {
      throw new Error("Email code sign in is not available for this account.");
    }

    const prepared = await signIn.prepareFirstFactor({
      strategy: "email_code",
      emailAddressId: emailCodeFactor.emailAddressId,
    });

    setPendingSignIn(prepared || signIn);
  };

  const verifyEmailCode = async (code: string) => {
    if (!pendingSignIn) {
      throw new Error("Start email code sign in first.");
    }

    const signIn = await pendingSignIn.attemptFirstFactor({
      strategy: "email_code",
      code,
    });
    await activateSession(signIn);
  };

  const signInWithPassword = async (email: string, password: string) => {
    const signIn = await clerkClient.client.signIn.create({
      identifier: email,
      password,
    });
    await activateSession(signIn);
  };

  return {
    sendEmailCode,
    verifyEmailCode,
    signInWithPassword,
  };
}
