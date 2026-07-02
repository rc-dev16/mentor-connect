type TokenGetter = () => Promise<string | null>;

let tokenGetter: TokenGetter | null = null;

export function registerClerkTokenGetter(getter: TokenGetter | null) {
  tokenGetter = getter;
}

export async function getClerkSessionToken(): Promise<string | null> {
  if (tokenGetter) {
    return tokenGetter();
  }

  // Fallback before AuthBridge mounts
  const clerk = (window as { Clerk?: { session?: { getToken: (opts?: { template?: string }) => Promise<string | null> } } }).Clerk;
  if (!clerk?.session) return null;

  try {
    return await clerk.session.getToken();
  } catch (err) {
    console.error("[clerk-token] window.Clerk session token lookup failed:", err);
    throw err;
  }
}
