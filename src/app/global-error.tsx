"use client";

// Catches errors thrown from the root layout itself, which `error.tsx`
// cannot — must render its own <html>/<body> since the real layout may be
// what failed. Same no-leak guarantee as error.tsx: production strips the
// message/stack, leaving only an opaque `digest`.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-6 text-center text-slate-900">
        <p className="text-sm font-medium text-red-600">Something went wrong</p>
        <h1 className="text-xl font-semibold">The application failed to load</h1>
        <p className="max-w-sm text-sm text-slate-500">
          Please try again. If this keeps happening, contact your school administrator.
        </p>
        {error.digest && <p className="text-xs text-slate-400">Reference: {error.digest}</p>}
        <button
          onClick={reset}
          className="mt-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
