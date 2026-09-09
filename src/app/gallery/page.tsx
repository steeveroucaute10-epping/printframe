import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery — PrintFrame Inspiration",
  description: "Get inspired by photos our customers have framed.",
};

export default function Page() {
  const grid = [
    { label: "Family Portrait", gradient: "from-blue-100 to-blue-200" },
    { label: "Nature Scene", gradient: "from-green-100 to-green-200" },
    { label: "Pet Photo", gradient: "from-amber-100 to-amber-200" },
    { label: "Wedding", gradient: "from-pink-100 to-pink-200" },
    { label: "Landscape", gradient: "from-teal-100 to-teal-200" },
    { label: "Abstract Art", gradient: "from-purple-100 to-purple-200" },
    { label: "Baby Photo", gradient: "from-rose-100 to-rose-200" },
    { label: "Travel Memory", gradient: "from-indigo-100 to-indigo-200" },
    { label: "Graduation", gradient: "from-cyan-100 to-cyan-200" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-printframe-950 font-display mb-4 text-center">
        Gallery
      </h1>
      <p className="text-center text-printframe-600 mb-12 max-w-xl mx-auto">
        Get inspired by how our customers are displaying their favorite memories.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {grid.map((item, i) => (
          <div
            key={i}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${item.gradient} aspect-[4/5] flex items-center justify-center`}
          >
            <div className="text-center p-6">
              <div className="h-64 w-48 bg-white/80 rounded shadow-lg mx-auto flex items-center justify-center">
                <span className="text-xs text-printframe-400">{item.label}</span>
              </div>
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="bg-white text-printframe-900 px-4 py-2 rounded-full font-medium text-sm">
                View
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
