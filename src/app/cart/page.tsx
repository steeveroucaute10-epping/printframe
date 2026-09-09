export default function Page() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-printframe-950 font-display mb-8">
        Cart
      </h1>

      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-24 w-24 rounded-full bg-printframe-100 flex items-center justify-center mb-6">
          <span className="text-4xl">🛒</span>
        </div>
        <h2 className="text-xl font-semibold text-printframe-700 mb-2">
          Your cart is empty
        </h2>
        <p className="text-printframe-500 mb-6">
          Upload a photo and customize a frame to get started.
        </p>
        <a
          href="/create"
          className="inline-flex h-10 items-center rounded-md bg-printframe-900 px-4 py-2 text-sm font-medium text-white hover:bg-printframe-800"
        >
          Start Creating
        </a>
      </div>
    </div>
  );
}
