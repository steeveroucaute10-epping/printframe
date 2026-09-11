import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { 
  Star, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  ArrowRight, 
  CheckCircle2,
  Sparkles,
  Heart,
  Clock,
  Upload,
  Layout,
  Package,
  Leaf
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-printframe-50 via-white to-printframe-100">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent-blue/10 px-4 py-2 text-sm font-medium text-accent-blue">
                <Sparkles className="h-4 w-4" />
                Eco-Friendly Cardboard Frames
              </div>
              
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-printframe-950 sm:text-5xl lg:text-6xl font-display">
                Turn Your Memories Into{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-accent-purple">
                  Beautiful Frames
                </span>
              </h1>
              
              <p className="max-w-xl text-lg text-printframe-600">
                Upload your photo, choose your frame style, and we create a premium custom frame with eco-friendly cardboard — delivered to your door in days.
              </p>
              
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/frames">
                  <Button size="lg" className="text-base gap-2 group">
                    Start Creating
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="outline" size="lg" className="text-base">
                    See How It Works
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-accent-amber text-accent-amber" />
                  ))}
                  <span className="ml-1 text-sm font-medium text-printframe-700">4.9/5</span>
                </div>
                <span className="text-sm text-printframe-500">from 2,400+ reviews</span>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 mx-auto max-w-md">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-printframe-100 shadow-2xl">
                  <div className="flex h-full items-center justify-center p-8">
                    <div className="w-full">
                      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-white p-4 shadow-inner">
                        <div className="flex h-full items-center justify-center rounded bg-gradient-to-br from-accent-blue/5 to-accent-purple/5">
                          <div className="text-center">
                            <Sparkles className="h-8 w-8 text-printframe-300 mx-auto mb-2" />
                            <p className="text-sm text-printframe-400">Your photo here</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-accent-blue/10" />
                  <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-accent-purple/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="border-y border-border/40 bg-printframe-50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <ShieldCheck className="h-8 w-8 text-accent-blue mx-auto mb-3" />
              <h3 className="font-semibold text-printframe-900">Premium Quality</h3>
              <p className="mt-1 text-sm text-printframe-600">Archival-grade prints</p>
            </div>
            <div className="text-center">
              <Truck className="h-8 w-8 text-accent-blue mx-auto mb-3" />
              <h3 className="font-semibold text-printframe-900">Fast Delivery</h3>
              <p className="mt-1 text-sm text-printframe-600">5-7 day standard</p>
            </div>
            <div className="text-center">
              <RefreshCw className="h-8 w-8 text-accent-blue mx-auto mb-3" />
              <h3 className="font-semibold text-printframe-900">Easy Returns</h3>
              <p className="mt-1 text-sm text-printframe-600">30-day guarantee</p>
            </div>
            <div className="text-center">
              <Leaf className="h-8 w-8 text-accent-blue mx-auto mb-3" />
              <h3 className="font-semibold text-printframe-900">Eco-Friendly</h3>
              <p className="mt-1 text-sm text-printframe-600">Sustainable cardboard</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-printframe-950 font-display sm:text-4xl">
              Three Simple Steps
            </h2>
            <p className="mt-4 text-lg text-printframe-600">
              No complicated processes. Just upload, choose, and we handle the rest.
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            {[
              {
                icon: Upload,
                step: "1",
                title: "Upload Your Photo",
                description: "Drag and drop your favorite photo. Works with any image — portraits, landscapes, pets, you name it."
              },
              {
                icon: Layout,
                step: "2",
                title: "Choose Your Frame",
                description: "Select your size, color, and matting option. See a real-time preview as you customize."
              },
              {
                icon: Package,
                step: "3",
                title: "We Print & Deliver",
                description: "We print, frame, and ship your custom piece with care. Arrives ready to hang."
              }
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-blue/10 text-accent-blue mb-6">
                  <item.icon className="h-8 w-8" />
                </div>
                <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-accent-blue text-white text-sm font-medium flex items-center justify-center">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-printframe-900 mb-3">{item.title}</h3>
                <p className="text-printframe-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Sizes */}
      <section className="py-20 lg:py-32 bg-printframe-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-printframe-950 font-display sm:text-4xl">
              Choose Your Size
            </h2>
            <p className="mt-4 text-lg text-printframe-600">
              Five standard sizes to fit every space and every photo.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { size: '4×6', price: 24.99, popular: false },
              { size: '5×7', price: 29.99, popular: false },
              { size: '8×10', price: 39.99, popular: true },
              { size: '11×14', price: 54.99, popular: false },
              { size: '16×20', price: 79.99, popular: false },
            ].map((frame, i) => (
              <Link href={`/frames?size=${frame.size}`} key={i} className="group relative">
                <div className={`relative overflow-hidden rounded-2xl border border-border/60 bg-white p-6 transition-all hover:shadow-lg ${frame.popular ? 'ring-2 ring-accent-blue' : ''}`}>
                  {frame.popular && (
                    <span className="absolute top-3 right-3 rounded-full bg-accent-blue px-2 py-1 text-[10px] font-medium text-white">
                      POPULAR
                    </span>
                  )}
                  <div className="aspect-[3/4] rounded-lg bg-printframe-100 mb-4 flex items-center justify-center">
                    <div className="w-2/3 h-3/4 rounded bg-white shadow-sm flex items-center justify-center">
                      <span className="text-xs text-printframe-400">{frame.size}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-printframe-900">{frame.size} inch</h3>
                  <p className="mt-2 text-2xl font-bold text-accent-blue">${frame.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-printframe-950 font-display sm:text-4xl">
              Loved by Thousands
            </h2>
            <p className="mt-4 text-lg text-printframe-600">
              See what our customers have to say about their custom frames.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Sarah M.",
                location: "New York, NY",
                rating: 5,
                text: "Absolutely stunning! The quality exceeded my expectations. The frame looks so much more expensive than it is. Already ordered two more for gifts.",
                photo: true
              },
              {
                name: "James K.",
                location: "London, UK",
                rating: 5,
                text: "Ordered a custom frame for my parents' anniversary. The real-time preview was spot-on and the delivery was faster than expected. Highly recommend!",
                photo: true
              },
              {
                name: "Mia L.",
                location: "Sydney, AU",
                rating: 5,
                text: "Love the eco-friendly packaging and the frame quality. The cardboard is surprisingly sturdy. My daughter's school photo looks amazing in it.",
                photo: false
              }
            ].map((review, i) => (
              <div key={i} className="rounded-2xl border border-border/40 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-accent-amber text-accent-amber" />
                  ))}
                </div>
                <p className="text-printframe-700 leading-relaxed mb-4">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent-blue/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-accent-blue">{review.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-printframe-900">{review.name}</p>
                    <p className="text-xs text-printframe-500">{review.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-printframe-900 to-printframe-950">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white font-display sm:text-4xl max-w-2xl mx-auto">
            Ready to Frame Your Memories?
          </h2>
          <p className="mt-4 text-lg text-printframe-300 max-w-xl mx-auto">
            Upload your photo today and get a custom frame in just 5-7 days. Free shipping on orders over $50.
          </p>
          <div className="mt-8">
            <Link href="/frames">
              <Button size="lg" variant="accent" className="text-base gap-2 bg-white text-printframe-900 hover:bg-printframe-100">
                Start Creating Your Frame
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

// Icons imported from lucide-react at the top
import { Upload, Layout, Package, Leaf } from "lucide-react"
