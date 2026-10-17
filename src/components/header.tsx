"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Menu, X, User } from "lucide-react"
import { useCart } from "@/lib/cart-context"

const NAV_LINKS = [
  { href: "/frames", label: "Frames" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
]

export default function Header() {
  const { itemCount } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
            Print<span className="text-primary">Frame</span>
          </Link>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Center: Mobile logo */}
        <Link href="/" className="md:hidden text-xl font-bold tracking-tight text-foreground">
          Print<span className="text-primary">Frame</span>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Link href="/account">
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-card">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
