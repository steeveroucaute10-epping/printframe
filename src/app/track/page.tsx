export default function Page() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-printframe-950 font-display mb-8">
        Order Tracking
      </h1>
      
      <div className="max-w-lg mx-auto">
        <div className="rounded-xl border border-border/60 bg-white p-6">
          <h2 className="text-lg font-semibold text-printframe-900 mb-4">
            Track Your Order
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter order number"
              className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <button className="h-10 rounded-md bg-printframe-900 px-4 text-sm font-medium text-white hover:bg-printframe-800">
              Track
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-border/60 bg-printframe-50 p-6">
          <div className="flex items-start gap-3">
            <div className="mt-1 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs">✓</span>
            </div>
            <div>
              <p className="font-medium text-printframe-900">Order Placed</p>
              <p className="text-sm text-printframe-500">Your order has been received</p>
            </div>
          </div>
          <div className="ml-3 mt-6 h-12 border-l-2 border-border/60 ml-0" />
          <div className="flex items-start gap-3 mt-6">
            <div className="mt-1 h-6 w-6 rounded-full bg-printframe-300 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs">•</span>
            </div>
            <div>
              <p className="font-medium text-printframe-500">Preparing for Print</p>
              <p className="text-sm text-printframe-400">Awaiting confirmation</p>
            </div>
          </div>
          <div className="ml-3 mt-6 h-12 border-l-2 border-border/60 ml-0" />
          <div className="flex items-start gap-3 mt-6">
            <div className="mt-1 h-6 w-6 rounded-full bg-printframe-300 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs">•</span>
            </div>
            <div>
              <p className="font-medium text-printframe-500">In Production</p>
              <p className="text-sm text-printframe-400">Your frame is being made</p>
            </div>
          </div>
          <div className="ml-3 mt-6 h-12 border-l-2 border-border/60 ml-0" />
          <div className="flex items-start gap-3 mt-6">
            <div className="mt-1 h-6 w-6 rounded-full bg-printframe-300 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs">•</span>
            </div>
            <div>
              <p className="font-medium text-printframe-500">Shipped</p>
              <p className="text-sm text-printframe-400">On its way to you</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
