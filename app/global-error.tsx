"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm">
          {error.digest && `Error ID: ${error.digest}`}
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-md bg-gray-900 px-6 py-2 text-sm text-white hover:opacity-90"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
