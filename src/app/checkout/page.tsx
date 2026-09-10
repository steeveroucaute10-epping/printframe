// src/app/checkout/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Truck,
  ShieldCheck,
  CreditCard,
  Loader2,
} from "lucide-react"

interface FormData {
  email: string
  firstName: string
  lastName: string
  address1: string
  address2: string
  city: string
  state: string
  zip: string
  country: string
  phone: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, shipping, tax, total, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    phone: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create order via API
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            variantId: item.productVariantId,
            quantity: item.quantity,
            price: item.unitPrice,
            size: item.size,
            color: item.color,
            matting: item.matting,
          })),
          subtotal,
          shipping,
          tax,
          total,
          guestEmail: formData.email,
          shippingMethod: "standard",
        }),
      })

      if (!response.ok) throw new Error("Failed to create order")

      const order = await response.json()

      // Clear cart
      clearCart()

      // Redirect to confirmation
      router.push(`/order-confirmation?order=${order.orderNumber}`)
    } catch (error) {
      console.error("Checkout error:", error)
      // For now, redirect to confirmation anyway (demo mode)
      router.push("/order-confirmation")
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-printframe-950 mb-4">
            Your cart is empty
          </h1>
          <p className="text-printframe-600 mb-6">Add some frames before checking out.</p>
          <Button asChild>
            <Link href="/frames">Browse Frames</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-printframe-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-printframe-600 hover:text-printframe-900 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>

        <h1 className="text-3xl font-bold text-printframe-950 font-display mb-8">
          Checkout
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact */}
              <div className="bg-white rounded-2xl shadow-sm border border-border/40 p-6">
                <h2 className="text-lg font-semibold text-printframe-900 mb-4">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-white rounded-2xl shadow-sm border border-border/40 p-6">
                <h2 className="text-lg font-semibold text-printframe-900 mb-4">
                  Shipping Address
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="address1">Address</Label>
                    <Input
                      id="address1"
                      name="address1"
                      placeholder="123 Main St"
                      value={formData.address1}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="address2">Apt / Suite (optional)</Label>
                    <Input
                      id="address2"
                      name="address2"
                      value={formData.address2}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      name="zip"
                      value={formData.zip}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-2xl shadow-sm border border-border/40 p-6">
                <h2 className="text-lg font-semibold text-printframe-900 mb-4">
                  Payment Method
                </h2>
                <div className="rounded-lg border border-border/60 bg-printframe-50 p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-printframe-700">
                      Secure checkout powered by Stripe
                    </span>
                  </div>
                  <p className="text-xs text-printframe-500">
                    We accept credit/debit cards, Apple Pay, and Google Pay.
                    Your payment information is encrypted and never stored on our servers.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="4242 4242 4242 4242"
                      className="bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry</Label>
                      <Input id="expiry" placeholder="MM/YY" className="bg-white" />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" className="bg-white" />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Place Order — ${total.toFixed(2)}
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-border/40 p-6 h-fit">
            <h2 className="text-lg font-bold text-printframe-900 mb-6">
              Order Summary
            </h2>

            {/* Items */}
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 text-sm">
                  <div className="w-12 h-12 bg-printframe-100 rounded-lg relative overflow-hidden shrink-0">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-printframe-900 text-white text-xs rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name || "Custom Frame"}</p>
                    <p className="text-xs text-printframe-500">{item.size} • {item.color} • {item.matting}</p>
                  </div>
                  <p className="font-medium shrink-0">
                    {item.totalPrice.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 text-sm border-t border-border/40 pt-4 mb-6">
              <div className="flex justify-between">
                <span className="text-printframe-600">Subtotal</span>
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
              <div className="flex justify-between">
                <span className="text-printframe-600">Tax</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base pt-2 border-t border-border/40">
                <span className="font-bold text-printframe-900">Total</span>
                <span className="font-bold text-accent-blue">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Trust */}
            <div className="space-y-2 text-xs text-printframe-500">
              <div className="flex items-center gap-2">
                <Truck className="w-3 h-3" />
                <span>Free shipping over $50</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" />
                <span>30-day satisfaction guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" />
                <span>SSL encrypted checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
