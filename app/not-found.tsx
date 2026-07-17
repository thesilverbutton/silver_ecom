import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-lg text-[var(--muted-foreground)]">Page not found</p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-[var(--primary)] px-6 py-2 text-sm text-[var(--primary-foreground)] hover:opacity-90"
      >
        Back to Home
      </Link>
    </main>
  );
}
