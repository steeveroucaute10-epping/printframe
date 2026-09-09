export default function Page() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-printframe-950 font-display mb-8">
        Returns & Exchanges
      </h1>

      <div className="space-y-8 text-printframe-600">
        <section>
          <h2 className="text-xl font-semibold text-printframe-900 mb-3">30-Day Guarantee</h2>
          <p>
            If you&apos;re not completely satisfied with your order, you can return it within 30 days for a full refund or a replacement print.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-printframe-900 mb-3">How to Return</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Contact us at <code>hello@printframe.com</code> with your order number.</li>
            <li>Pack the frame securely in its original packaging.</li>
            <li>Ship it back using the prepaid return label we provide.</li>
            <li>Once we receive your return, we&apos;ll process your refund within 5 business days.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-printframe-900 mb-3">Exchanges</h2>
          <p>
            If you&apos;d like a different size or color, we&apos;ll be happy to reprint your frame for free. Just contact us within 30 days.
          </p>
        </section>
      </div>
    </div>
  );
}
