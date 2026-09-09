import { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — PrintFrame",
  description: "Three simple steps to get your custom framed photo.",
};

export default function Page() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-printframe-950 font-display mb-8 text-center">
        How It Works
      </h1>

      <div className="space-y-16">
        {[
          {
            step: 1,
            title: "Upload Your Photo",
            description:
              "Drag and drop your favorite photo into our uploader. We accept JPG, PNG, and WebP files up to 25MB. For best results, use a high-resolution image (at least 1500×2000 pixels).",
            features: [
              "Drag & drop upload",
              "Automatic quality check",
              "Instant preview",
            ],
          },
          {
            step: 2,
            title: "Choose Your Frame",
            description:
              "Select from five standard sizes and four beautiful frame colors. Add optional white matting for a classic gallery look. See a real-time preview as you customize.",
            features: [
              "5 sizes (4×6 to 16×20 inches)",
              "4 frame colors",
              "Optional matting",
              "Live 3D preview",
            ],
          },
          {
            step: 3,
            title: "We Print & Deliver",
            description:
              "Our team prints your photo on archival-quality paper, assembles the eco-friendly cardboard frame, and ships it ready to hang. Standard delivery is 5-7 business days.",
            features: [
              "Archival-quality prints",
              "Eco-friendly materials",
              "5-7 day delivery",
              "Gift wrapping available",
            ],
          },
        ].map((item) => (
          <div key={item.step} className="flex flex-col gap-8 md:flex-row">
            <div className="flex-shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-blue text-white text-2xl font-bold">
                {item.step}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-printframe-900 mb-4">
                {item.title}
              </h2>
              <p className="text-printframe-600 leading-relaxed mb-4">
                {item.description}
              </p>
              <ul className="flex flex-wrap gap-2">
                {item.features.map((f) => (
                  <li
                    key={f}
                    className="rounded-full bg-printframe-100 px-3 py-1 text-xs font-medium text-printframe-700"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
