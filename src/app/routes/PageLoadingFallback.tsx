export function PageLoadingFallback() {
  return (
    <div className="flex h-full min-h-[16rem] items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Loading page...</p>
      </div>
    </div>
  );
}
