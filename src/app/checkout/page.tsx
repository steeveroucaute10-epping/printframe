export default function Page() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-printframe-950 font-display mb-8">
        Checkout
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-printframe-900 mb-4">
              Contact Information
            </h2>
            <input
              type="email"
              placeholder="Email address"
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-printframe-900 mb-4">
              Shipping Address
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="First name"
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Last name"
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Address"
                className="sm:col-span-2 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="City"
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Postal code"
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-printframe-900 mb-4">
              Payment
            </h2>
            <div className="rounded-lg border border-border/60 bg-printframe-50 p-4">
              <p className="text-sm text-printframe-600">
                Payment is processed securely via Stripe. We accept credit/debit cards, Apple Pay, and Google Pay.
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="rounded-xl border border-border/60 bg-printframe-50 p-6 h-fit">
          <h2 className="text-lg font-semibold text-printframe-900 mb-4">
            Order Summary
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-printframe-600">Subtotal</span>
              <span>$39.99</span>
            </div>
            <div className="flex justify-between">
              <span className="text-printframe-600">Shipping</span>
              <span>$5.99</span>
            </div>
            <div className="flex justify-between">
              <span className="text-printframe-600">Tax</span>
              <span>$3.60</span>
            </div>
            <div className="border-t border-border/40 pt-3">
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>$49.58</span>
              </div>
            </div>
          </div>
          <button className="mt-6 w-full h-11 rounded-md bg-printframe-900 text-sm font-medium text-white hover:bg-printframe-800">
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}
