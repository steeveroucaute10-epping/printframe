import { notFound } from "next/navigation"

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-printframe-900">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-printframe-700">Page not found</h2>
      <p className="mt-2 text-printframe-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <a href="/" className="mt-6 inline-flex items-center text-sm font-medium text-accent-blue hover:underline">
        Go back home
      </a>
    </div>
  )
}
