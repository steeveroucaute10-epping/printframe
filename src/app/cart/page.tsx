// src/app/cart/page.tsx
"use client"

import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import {
  ShoppingBag,
  ArrowRight,
  Minus,
  Plus,
  Trash2,
  Package,
  Truck,
} from "lucide-react"

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, itemCount } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <ShoppingBag className="w-16 h-16 text-printframe-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-printframe-950 font-display mb-4">
            Your cart is empty
          </h1>
          <p className="text-lg text-printframe-600 mb-8">
            Looks like you haven&apos;t added any frames yet.
          </p>
          <Button asChild size="lg">
            <Link href="/frames" className="gap-2">
              Browse Frames
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-printframe-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-printframe-950 font-display mb-8">
          Your Cart ({itemCount} item{itemCount !== 1 ? 's' : ''})
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-border/40 p-6 flex gap-6"
              >
                {/* Image */}
                <div className="w-32 h-32 bg-printframe-100 rounded-xl relative overflow-hidden shrink-0">
                  <Image
                    src={item.image || "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=300&q=80"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-printframe-900">{item.name || "Custom Frame"}</h3>
                      <p className="text-sm text-printframe-500">{item.size} • {item.color} • {item.matting}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-printframe-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center border border-border rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="ml-auto text-right">
                      <p className="text-sm text-printframe-500">Total</p>
                      <p className="font-bold text-printframe-900">${item.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear Cart */}
            <div className="flex justify-end pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-border/40 p-6 h-fit">
            <h2 className="text-lg font-bold text-printframe-900 mb-6">Order Summary</h2>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-printframe-600">Subtotal ({itemCount} items)</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-printframe-600">Shipping</span>
                <span className="font-medium">
                  {subtotal >= 50 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    "$5.99"
                  )}
                </span>
              </div>
              {subtotal < 50 && (
                <div className="flex items-center gap-2 text-xs text-accent-blue">
                  <Truck className="w-3 h-3" />
                  <span>Add ${(50 - subtotal).toFixed(2)} more for free shipping</span>
                </div>
              )}
              <div className="border-t border-border/40 pt-3 flex justify-between text-base">
                <span className="font-bold text-printframe-900">Total</span>
                <span className="font-bold text-accent-blue">
                  ${(subtotal + (subtotal >= 50 ? 0 : 5.99)).toFixed(2)}
                </span>
              </div>
            </div>

            <Button asChild size="lg" className="w-full mb-3">
              <Link href="/checkout" className="gap-2">
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/frames" className="gap-2">
                Continue Shopping
              </Link>
            </Button>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-border/40 space-y-3">
              <div className="flex items-center gap-2 text-xs text-printframe-500">
                <Package className="w-3 h-3" />
                <span>Eco-friendly materials</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-printframe-500">
                <Package className="w-3 h-3" />
                <span>Archival quality printing</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-printframe-500">
                <Package className="w-3 h-3" />
                <span>30-day satisfaction guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
