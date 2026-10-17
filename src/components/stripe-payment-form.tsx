"use client"

import { useState } from "react"
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { CreditCard, Loader2 } from "lucide-react"

interface StripePaymentFormProps {
  amount: number
  orderNumber: string
  onComplete: () => void
}

export function StripePaymentForm({
  amount,
  orderNumber,
  onComplete,
}: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function confirmPayment() {
    if (!stripe || !elements) return

    setSubmitting(true)
    setError("")

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation?order=${encodeURIComponent(orderNumber)}`,
      },
      redirect: "if_required",
    })

    if (result.error) {
      setError(result.error.message || "Payment could not be completed")
      setSubmitting(false)
      return
    }

    onComplete()
  }

  return (
    <div className="space-y-4">
      <PaymentElement />
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <Button
        type="button"
        size="lg"
        disabled={!stripe || !elements || submitting}
        className="w-full gap-2"
        onClick={confirmPayment}
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Confirming payment...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            Pay ${(amount / 100).toFixed(2)}
          </>
        )}
      </Button>
    </div>
  )
}
