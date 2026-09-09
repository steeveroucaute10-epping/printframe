export default function Page() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-printframe-950 font-display mb-8">
        My Account
      </h1>

      <div className="grid gap-8 md:grid-cols-4">
        {/* Sidebar */}
        <div className="space-y-1">
          {[
            { label: "Dashboard", href: "/account" },
            { label: "Orders", href: "/account/orders" },
            { label: "Addresses", href: "/account/addresses" },
            { label: "Wishlist", href: "/account/wishlist" },
            { label: "Settings", href: "/account/settings" },
            { label: "Support", href: "/account/support" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-printframe-600 hover:bg-printframe-100 hover:text-printframe-900"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          <div className="rounded-xl border border-border/60 bg-white p-6">
            <h2 className="text-lg font-semibold text-printframe-900 mb-4">
              Recent Orders
            </h2>
            <p className="text-printframe-500 text-sm">
              You haven&apos;t placed any orders yet.
            </p>
            <a
              href="/create"
              className="mt-4 inline-flex h-10 items-center rounded-md bg-printframe-900 px-4 py-2 text-sm font-medium text-white hover:bg-printframe-800"
            >
              Start Creating
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
