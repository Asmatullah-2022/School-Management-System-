import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center text-foreground">
      <p className="text-sm font-medium text-muted">404</p>
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="max-w-sm text-sm text-muted">
        The page you&rsquo;re looking for doesn&rsquo;t exist, or you don&rsquo;t have access to it.
      </p>
      <Link
        href="/dashboard"
        className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
