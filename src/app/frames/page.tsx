import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frames — PrintFrame",
  description: "Browse our collection of custom cardboard photo frames.",
};

export default function Page() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-printframe-950 font-display mb-8">
        Our Frames
      </h1>
      
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option>All Sizes</option>
          <option>4×6 inch</option>
          <option>5×7 inch</option>
          <option>8×10 inch</option>
          <option>11×14 inch</option>
          <option>16×20 inch</option>
        </select>
        <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option>Sort by: Featured</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
        </select>
      </div>

      {/* Product grid — placeholder for Phase 2 */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-white"
          >
            <div className="aspect-[4/5] bg-printframe-100 flex items-center justify-center">
              <span className="text-printframe-400">Frame Preview {i}</span>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-printframe-900">Classic Frame</h3>
              <p className="mt-1 text-sm text-printframe-500">Starting at $24.99</p>
              <div className="mt-3 flex gap-2">
                <span className="h-4 w-4 rounded-full bg-gray-900 border border-gray-600" />
                <span className="h-4 w-4 rounded-full bg-white border border-gray-300" />
                <span className="h-4 w-4 rounded-full bg-amber-600 border border-amber-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
