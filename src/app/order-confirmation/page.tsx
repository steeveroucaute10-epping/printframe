// src/app/order-confirmation/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  Mail,
  Phone,
} from "lucide-react"

export default function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; email?: string }>
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-printframe-50 to-white py-16">
      <div className="max-w-3xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-printframe-950 font-display mb-4">
            Order Confirmed!
          </h1>
          <p className="text-lg text-printframe-600">
            Thank you for your order. We&apos;re getting started on your custom frames right away.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-border/40 p-8 mb-8">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border/40">
            <div>
              <p className="text-sm text-printframe-500 mb-1">Order Number</p>
              <p className="text-xl font-bold text-printframe-950">PF-20260910-0001</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-printframe-500 mb-1">Date</p>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-4 p-4 bg-printframe-50 rounded-xl">
              <div className="w-20 h-20 bg-printframe-200 rounded-lg relative overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=200&q=80"
                  alt="Frame"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-printframe-900">Custom Cardboard Photo Frame</h3>
                <p className="text-sm text-printframe-500">8×10 • Matte Black • No Matting</p>
                <p className="text-sm text-printframe-500">Qty: 1</p>
              </div>
              <p className="font-bold text-printframe-900">$39.99</p>
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2 text-sm border-t border-border/40 pt-4">
            <div className="flex justify-between">
              <span className="text-printframe-600">Subtotal</span>
              <span className="font-medium">$39.99</span>
            </div>
            <div className="flex justify-between">
              <span className="text-printframe-600">Shipping</span>
              <span className="font-medium">$5.99</span>
            </div>
            <div className="flex justify-between">
              <span className="text-printframe-600">Tax</span>
              <span className="font-medium">$3.60</span>
            </div>
            <div className="flex justify-between text-base pt-2 border-t border-border/40">
              <span className="font-bold text-printframe-900">Total</span>
              <span className="font-bold text-accent-blue">$49.58</span>
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-border/40 p-8 mb-8">
          <h2 className="text-xl font-bold text-printframe-900 mb-6">Order Timeline</h2>
          <div className="space-y-6">
            {/* Processing */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-accent-blue flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <div className="w-0.5 h-full bg-accent-blue/30 my-1" />
              </div>
              <div className="pb-6">
                <h3 className="font-semibold text-printframe-900">Processing</h3>
                <p className="text-sm text-printframe-500">Your order is being prepared for printing</p>
                <p className="text-xs text-accent-blue mt-1">Started</p>
              </div>
            </div>

            {/* Printing */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-printframe-200 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-printframe-400" />
                </div>
                <div className="w-0.5 h-full bg-printframe-200 my-1" />
              </div>
              <div className="pb-6">
                <h3 className="font-semibold text-printframe-700">Printing</h3>
                <p className="text-sm text-printframe-500">Your photos will be printed on archival paper</p>
                <p className="text-xs text-printframe-400 mt-1">Estimated: 1-2 days</p>
              </div>
            </div>

            {/* Quality Check */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-printframe-200 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-printframe-400" />
                </div>
                <div className="w-0.5 h-full bg-printframe-200 my-1" />
              </div>
              <div className="pb-6">
                <h3 className="font-semibold text-printframe-700">Quality Check</h3>
                <p className="text-sm text-printframe-500">Each frame is inspected before shipping</p>
                <p className="text-xs text-printframe-400 mt-1">Estimated: same day</p>
              </div>
            </div>

            {/* Shipping */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-printframe-200 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-printframe-400" />
                </div>
                <div className="w-0.5 h-full bg-printframe-200 my-1" />
              </div>
              <div>
                <h3 className="font-semibold text-printframe-700">Shipping</h3>
                <p className="text-sm text-printframe-500">Standard delivery via trusted courier</p>
                <p className="text-xs text-printframe-400 mt-1">Estimated: 5-7 business days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Email & Support */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-border/40 p-6">
            <Mail className="w-8 h-8 text-accent-blue mb-3" />
            <h3 className="font-semibold text-printframe-900 mb-2">Order Confirmation Email</h3>
            <p className="text-sm text-printframe-500 mb-4">
              A confirmation email has been sent with your order details and tracking information.
            </p>
            <p className="text-xs text-printframe-400">sent to: customer@email.com</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-border/40 p-6">
            <Phone className="w-8 h-8 text-accent-blue mb-3" />
            <h3 className="font-semibold text-printframe-900 mb-2">Need Help?</h3>
            <p className="text-sm text-printframe-500 mb-4">
              Our customer support team is here to help with any questions.
            </p>
            <p className="text-xs text-printframe-400">support@printframe.com</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/frames">
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
