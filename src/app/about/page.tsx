import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About PrintFrame — Our Story",
  description: "Learn about our mission to make frame art accessible, affordable, and sustainable.",
};

export default function Page() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-printframe-950 font-display mb-8 text-center">
        About PrintFrame
      </h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-xl text-printframe-600 leading-relaxed">
          PrintFrame was born from a simple idea: <strong>everyone deserves to display their favorite memories in a beautiful frame — without breaking the bank.</strong>
        </p>

        <h2 className="text-2xl font-semibold text-printframe-900 mt-12 mb-4">Our Mission</h2>
        <p className="text-printframe-600 leading-relaxed">
          Traditional frames can cost anywhere from $30 to $200 — and they rarely fit the exact size of your photo. We set out to create a better way: custom-sized frames made from sustainable cardboard, priced so everyone can afford them.
        </p>

        <h2 className="text-2xl font-semibold text-printframe-900 mt-12 mb-4">Why Cardboard?</h2>
        <p className="text-printframe-600 leading-relaxed">
          Our frames are made from <strong>100% recycled cardboard</strong> that&apos;s been precision-engineered to be surprisingly sturdy and elegant. Each frame is:
        </p>
        <ul className="text-printframe-600">
          <li>Lightweight — easy to hang and ship</li>
          <li>Eco-friendly — made from recycled materials</li>
          <li>Durable — tested to hold photos up to 16×20 inches</li>
          <li>Affordable — starting at just $24.99</li>
        </ul>

        <h2 className="text-2xl font-semibold text-printframe-900 mt-12 mb-4">Our Values</h2>
        <div className="grid gap-6 sm:grid-cols-2 mt-6">
          <div className="rounded-xl border border-border/40 p-6">
            <h3 className="font-semibold text-printframe-900 mb-2">Quality First</h3>
            <p className="text-sm text-printframe-600">Archival-grade prints that last for decades.</p>
          </div>
          <div className="rounded-xl border border-border/40 p-6">
            <h3 className="font-semibold text-printframe-900 mb-2">Sustainability</h3>
            <p className="text-sm text-printframe-600">Recycled materials and plastic-free packaging.</p>
          </div>
          <div className="rounded-xl border border-border/40 p-6">
            <h3 className="font-semibold text-printframe-900 mb-2">Accessibility</h3>
            <p className="text-sm text-printframe-600">Premium quality at prices everyone can afford.</p>
          </div>
          <div className="rounded-xl border border-border/40 p-6">
            <h3 className="font-semibold text-printframe-900 mb-2">Speed</h3>
            <p className="text-sm text-printframe-600">From upload to your door in just 5-7 days.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
