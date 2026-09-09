export default function Page() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-printframe-950 font-display mb-8">
        Shipping Information
      </h1>

      <div className="space-y-8 text-printframe-600">
        <section>
          <h2 className="text-xl font-semibold text-printframe-900 mb-3">Standard Shipping</h2>
          <p>5–7 business days. $5.99 flat rate.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-printframe-900 mb-3">Express Shipping</h2>
          <p>2–3 business days. $9.99.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-printframe-900 mb-3">Free Shipping</h2>
          <p>Orders over $50 qualify for free standard shipping.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-printframe-900 mb-3">International Shipping</h2>
          <p>We currently ship to the US, UK, Canada, and Australia. International rates vary by destination.</p>
        </section>
      </div>
    </div>
  );
}
