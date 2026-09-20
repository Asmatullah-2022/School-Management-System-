"use client";

// Server Components' errors are never sent to the client verbatim — Next.js
// strips the message and stack from `error` here in production and gives
// only a `digest` (a reference id to look up in server logs), so this
// boundary can never leak a raw SQL/Postgres error, a stack trace, or any
// secret to the person using the app, no matter what threw.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center text-foreground">
      <p className="text-sm font-medium text-danger">Something went wrong</p>
      <h1 className="text-xl font-semibold">We hit a problem loading this page</h1>
      <p className="max-w-sm text-sm text-muted">
        Please try again. If this keeps happening, contact your school administrator.
      </p>
      {error.digest && <p className="text-xs text-muted">Reference: {error.digest}</p>}
      <button
        onClick={reset}
        className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Try Again
      </button>
    </div>
  );
}
