import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { logSecurityEvent } from '@/lib/security-log'
import { readTextBody, RequestBodyError } from '@/lib/request-json'

export const runtime = 'nodejs'

function validatePaymentIntent(
  intent: Stripe.PaymentIntent,
  order: {
    id: string
    total: number
    status: string
    payment: {
      id: string
      amount: number
      currency: string
      status: string
      stripePaymentId: string | null
    } | null
  },
  amount: number,
): string | null {
  if (!order.payment) return 'Order payment record is missing'
  if (amount !== order.total || amount !== order.payment.amount) {
    return 'Payment amount does not match order'
  }
  if (intent.currency.toUpperCase() !== order.payment.currency.toUpperCase()) {
    return 'Payment currency does not match order'
  }
  if (
    order.payment.stripePaymentId &&
    order.payment.stripePaymentId !== intent.id
  ) {
    return 'Payment intent does not match order'
  }
  return null
}

async function loadOrder(intent: Stripe.PaymentIntent) {
  const orderId = intent.metadata?.orderId
  if (!orderId) return null

  return prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  })
}

async function handleSucceeded(intent: Stripe.PaymentIntent) {
  const order = await loadOrder(intent)
  if (!order) {
    return NextResponse.json({ error: 'Unknown order' }, { status: 400 })
  }

  const mismatch = validatePaymentIntent(intent, order, intent.amount_received)
  if (mismatch) {
    logSecurityEvent('stripe_webhook_payment_mismatch', {
      intentId: intent.id,
      orderId: order.id,
      reason: mismatch,
    })
    return NextResponse.json({ error: mismatch }, { status: 400 })
  }

  if (order.status === 'CONFIRMED' && order.payment?.status === 'COMPLETED') {
    return NextResponse.json({ received: true, duplicate: true })
  }
  if (order.status !== 'PENDING') {
    return NextResponse.json(
      { error: 'Order is not awaiting payment' },
      { status: 409 },
    )
  }

  const transitioned = await prisma.$transaction(async (tx) => {
    const orderResult = await tx.order.updateMany({
      where: { id: order.id, status: 'PENDING' },
      data: { status: 'CONFIRMED' },
    })
    if (orderResult.count !== 1) return false

    const paymentResult = await tx.payment.updateMany({
      where: {
        id: order.payment!.id,
        status: { in: ['PENDING', 'FAILED'] },
        OR: [
          { stripePaymentId: null },
          { stripePaymentId: intent.id },
        ],
      },
      data: {
        status: 'COMPLETED',
        stripePaymentId: intent.id,
      },
    })
    if (paymentResult.count !== 1) {
      throw new Error('Payment state changed during confirmation')
    }
    return true
  })

  if (!transitioned) {
    const current = await loadOrder(intent)
    if (
      current?.status === 'CONFIRMED' &&
      current.payment?.status === 'COMPLETED'
    ) {
      return NextResponse.json({ received: true, duplicate: true })
    }
    return NextResponse.json({ error: 'Payment transition conflict' }, { status: 409 })
  }

  return NextResponse.json({ received: true })
}

async function handleFailed(intent: Stripe.PaymentIntent) {
  const order = await loadOrder(intent)
  if (!order) {
    return NextResponse.json({ error: 'Unknown order' }, { status: 400 })
  }

  const mismatch = validatePaymentIntent(intent, order, intent.amount)
  if (mismatch) {
    logSecurityEvent('stripe_webhook_payment_mismatch', {
      intentId: intent.id,
      orderId: order.id,
      reason: mismatch,
    })
    return NextResponse.json({ error: mismatch }, { status: 400 })
  }

  if (order.payment?.status !== 'COMPLETED') {
    await prisma.payment.updateMany({
      where: {
        id: order.payment!.id,
        status: { not: 'COMPLETED' },
        OR: [
          { stripePaymentId: null },
          { stripePaymentId: intent.id },
        ],
      },
      data: {
        status: 'FAILED',
        stripePaymentId: intent.id,
      },
    })
  }

  return NextResponse.json({ received: true })
}

async function handleCanceled(intent: Stripe.PaymentIntent) {
  const order = await loadOrder(intent)
  if (!order) {
    return NextResponse.json({ error: 'Unknown order' }, { status: 400 })
  }

  const mismatch = validatePaymentIntent(intent, order, intent.amount)
  if (mismatch) {
    logSecurityEvent('stripe_webhook_payment_mismatch', {
      intentId: intent.id,
      orderId: order.id,
      reason: mismatch,
    })
    return NextResponse.json({ error: mismatch }, { status: 400 })
  }
  if (order.status === 'CONFIRMED' || order.payment?.status === 'COMPLETED') {
    return NextResponse.json(
      { error: 'Completed payment cannot be canceled by webhook' },
      { status: 409 },
    )
  }

  await prisma.$transaction([
    prisma.payment.updateMany({
      where: {
        id: order.payment!.id,
        status: { not: 'COMPLETED' },
        OR: [
          { stripePaymentId: null },
          { stripePaymentId: intent.id },
        ],
      },
      data: {
        status: 'FAILED',
        stripePaymentId: intent.id,
      },
    }),
    prisma.order.updateMany({
      where: { id: order.id, status: 'PENDING' },
      data: { status: 'CANCELLED' },
    }),
  ])

  return NextResponse.json({ received: true })
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'Webhook is not configured' },
      { status: 503 },
    )
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let rawBody: string
  try {
    rawBody = await readTextBody(request, 1024 * 1024)
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    throw error
  }
  const stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY || 'sk_test_webhook_verification',
  )

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch {
    logSecurityEvent('stripe_webhook_invalid_signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    const intent = event.data.object as Stripe.PaymentIntent
    switch (event.type) {
      case 'payment_intent.succeeded':
        return handleSucceeded(intent)
      case 'payment_intent.payment_failed':
        return handleFailed(intent)
      case 'payment_intent.canceled':
        return handleCanceled(intent)
      default:
        return NextResponse.json({ received: true, ignored: true })
    }
  } catch (error) {
    console.error('Stripe webhook processing failed:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
