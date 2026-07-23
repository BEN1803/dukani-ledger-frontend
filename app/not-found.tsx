import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-900">
      <h1 className="text-6xl font-bold text-emerald-600">404</h1>
      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
        Page not found
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-6 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
