import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-printframe-950 text-printframe-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="text-xl font-bold tracking-tight text-white">
              Print<span className="text-accent-blue">Frame</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed">
              Turn your precious photos into stunning custom frames. Premium quality, eco-friendly cardboard, delivered to your door.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-white mb-3">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/frames" className="hover:text-white transition-colors">All Frames</Link></li>
              <li><Link href="/frames?size=4x6" className="hover:text-white transition-colors">4×6 Frames</Link></li>
              <li><Link href="/frames?size=8x10" className="hover:text-white transition-colors">8×10 Frames</Link></li>
              <li><Link href="/frames?size=16x20" className="hover:text-white transition-colors">Large Frames</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping Info</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="/track" className="hover:text-white transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
            <div className="mt-6">
              <p className="text-xs text-printframe-500">
                © {new Date().getFullYear()} PrintFrame. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
