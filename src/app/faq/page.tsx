export default function Page() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-printframe-950 font-display mb-8">
        Frequently Asked Questions
      </h1>

      <div className="space-y-6">
        {[
          {
            q: "What materials are your frames made from?",
            a: "Our frames are made from 100% recycled cardboard that has been precision-engineered to be sturdy and durable. The prints use archival-quality paper with water-resistant inks.",
          },
          {
            q: "How long does delivery take?",
            a: "Standard delivery is 5-7 business days. Express delivery (2-3 business days) is available for an additional $9.99.",
          },
          {
            q: "Can I return or exchange my frame?",
            a: "Yes! We offer a 30-day hassle-free return policy. If you&apos;re not satisfied, send it back and we&apos;ll issue a full refund or print a replacement.",
          },
          {
            q: "What photo formats do you accept?",
            a: "We accept JPG, PNG, and WebP files up to 25MB. For the best quality, we recommend images that are at least 1500×2000 pixels.",
          },
          {
            q: "Do you offer gift wrapping?",
            a: "Yes, gift wrapping is available for $3.99. We use eco-friendly recyclable materials.",
          },
          {
            q: "Are your frames suitable for outdoor use?",
            a: "Our frames are designed for indoor use only. The cardboard material is not waterproof.",
          },
        ].map((item, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-white p-6">
            <h3 className="font-semibold text-printframe-900 mb-2">{item.q}</h3>
            <p className="text-printframe-600 text-sm leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
