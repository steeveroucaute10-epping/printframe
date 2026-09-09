export default function Page() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-printframe-950 font-display mb-8">
        Contact Us
      </h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-printframe-900 mb-4">
            Get in Touch
          </h2>
          <div className="space-y-4 text-sm text-printframe-600">
            <p>
              <strong>Email:</strong> hello@printframe.com
            </p>
            <p>
              <strong>Support Hours:</strong> Mon–Fri, 9AM–6PM EST
            </p>
            <p>
              <strong>Phone:</strong> Coming soon
            </p>
          </div>
        </div>

        <form className="space-y-4">
          <input
            type="email"
            placeholder="Your email"
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Subject"
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Your message"
            rows={5}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <button className="h-10 rounded-md bg-printframe-900 px-6 text-sm font-medium text-white hover:bg-printframe-800">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
