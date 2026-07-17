"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        {error.digest && `Error ID: ${error.digest}`}
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-md bg-[var(--primary)] px-6 py-2 text-sm text-[var(--primary-foreground)] hover:opacity-90"
      >
        Try again
      </button>
    </main>
  );
}
