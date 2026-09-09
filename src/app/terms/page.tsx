export default function Page() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-printframe-950 font-display mb-8">
        Terms of Service
      </h1>
      <div className="text-printframe-600 text-sm leading-relaxed space-y-4">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>By accessing and using PrintFrame&apos;s services, you agree to be bound by these Terms of Service. Please read them carefully.</p>
        <h2 className="text-lg font-semibold text-printframe-900">1. Services</h2>
        <p>PrintFrame provides custom framing services for photos uploaded by customers. We print, frame, and ship physical products based on your specifications.</p>
        <h2 className="text-lg font-semibold text-printframe-900">2. User Content</h2>
        <p>By uploading photos, you confirm you own the rights to the images or have permission from the copyright holder. You grant PrintFrame a non-exclusive license to reproduce and display your photos solely for the purpose of fulfilling your order.</p>
        <h2 className="text-lg font-semibold text-printframe-900">3. Returns</h2>
        <p>We offer a 30-day return policy. See our Returns page for full details.</p>
        <h2 className="text-lg font-semibold text-printframe-900">4. Limitation of Liability</h2>
        <p>PrintFrame&apos;s liability for any order is limited to the total amount paid for that order.</p>
        <h2 className="text-lg font-semibold text-printframe-900">5. Governing Law</h2>
        <p>These terms are governed by the laws of the United States.</p>
      </div>
    </div>
  );
}
