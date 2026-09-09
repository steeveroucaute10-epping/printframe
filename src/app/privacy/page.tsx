export default function Page() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-printframe-950 font-display mb-8">
        Privacy Policy
      </h1>
      <div className="text-printframe-600 text-sm leading-relaxed space-y-4">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>PrintFrame is committed to protecting your privacy. This policy explains how we collect, use, and share your personal information.</p>
        <h2 className="text-lg font-semibold text-printframe-900">1. Information We Collect</h2>
        <p>We collect information you provide directly (name, email, address, payment details) and information automatically (browser type, IP address, pages visited).</p>
        <h2 className="text-lg font-semibold text-printframe-900">2. How We Use Your Data</h2>
        <p>We use your data to process orders, send shipping updates, improve our services, and send marketing communications (with your consent).</p>
        <h2 className="text-lg font-semibold text-printframe-900">3. Data Sharing</h2>
        <p>We share your data with payment processors (Stripe), shipping carriers, and hosting providers (Vercel, Cloudflare) solely to fulfill orders.</p>
        <h2 className="text-lg font-semibold text-printframe-900">4. Your Rights</h2>
        <p>You may request access to, correction of, or deletion of your personal data at any time by contacting hello@printframe.com.</p>
      </div>
    </div>
  );
}
