import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Menu, X, Heart, User } from "lucide-react"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-printframe-900">
            Print<span className="text-accent-blue">Frame</span>
          </Link>
          <Link href="/frames" className="text-sm font-medium text-printframe-600 hover:text-printframe-900 transition-colors">
            Frames
          </Link>
          <Link href="/how-it-works" className="text-sm font-medium text-printframe-600 hover:text-printframe-900 transition-colors">
            How It Works
          </Link>
          <Link href="/gallery" className="text-sm font-medium text-printframe-600 hover:text-printframe-900 transition-colors">
            Gallery
          </Link>
          <Link href="/about" className="text-sm font-medium text-printframe-600 hover:text-printframe-900 transition-colors">
            About
          </Link>
        </nav>

        {/* Center: Mobile logo */}
        <Link href="/" className="md:hidden text-xl font-bold tracking-tight text-printframe-900">
          Print<span className="text-accent-blue">Frame</span>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Link href="/wishlist">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/account">
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent-blue text-[10px] font-medium text-white flex items-center justify-center">
                0
              </span>
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden rounded-full">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
