export default function Page() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-printframe-950 font-display mb-8">
        Cookie Policy
      </h1>
      <div className="text-printframe-600 text-sm leading-relaxed space-y-4">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>PrintFrame uses cookies to ensure the site functions properly, remember your preferences, and improve your experience.</p>
        <h2 className="text-lg font-semibold text-printframe-900">Essential Cookies</h2>
        <p>Required for the site to function (session management, cart). Cannot be disabled.</p>
        <h2 className="text-lg font-semibold text-printframe-900">Analytics Cookies</h2>
        <p>Help us understand how visitors use our site (Google Analytics). Optional.</p>
        <h2 className="text-lg font-semibold text-printframe-900">Marketing Cookies</h2>
        <p>Used to deliver relevant ads (Meta Pixel, Google Ads). Optional.</p>
      </div>
    </div>
  );
}
