type AuthStatusProps = {
  title: string;
  description: string;
  onSignOut?: () => void;
};

export function AuthStatus({ title, description, onSignOut }: AuthStatusProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md rounded-lg border bg-card p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        {onSignOut && (
          <button
            type="button"
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            onClick={onSignOut}
          >
            Back to login
          </button>
        )}
      </div>
    </div>
  );
}
