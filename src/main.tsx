import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import { ClerkAuthBridge } from "@/auth/providers/ClerkAuthBridge";
import App from "@/app/App";
import "./index.css";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const rootElement = document.getElementById("root")!;

const MissingClerkConfig = () => (
  <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
    <div className="max-w-md rounded-lg border bg-card p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-foreground">Clerk is not configured</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Set VITE_CLERK_PUBLISHABLE_KEY before opening the Mentor-Connect login page.
      </p>
    </div>
  </div>
);

createRoot(rootElement).render(
  clerkPublishableKey ? (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <ClerkAuthBridge>
        <App />
      </ClerkAuthBridge>
    </ClerkProvider>
  ) : (
    <MissingClerkConfig />
  )
);
