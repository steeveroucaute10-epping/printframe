// src/app/api/payments/stripe/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getRequestUser } from '@/lib/auth'
import { z } from 'zod'
import Stripe from 'stripe'
import { readJsonBody, RequestBodyError } from '@/lib/request-json'
import { checkRateLimit } from '@/lib/rate-limit'
import { logSecurityEvent } from '@/lib/security-log'
import { SHIPPING_METHODS, SHIPPING_RATES_CENTS } from '@/lib/commerce'

const paymentSchema = z.object({
  items: z.array(z.object({
    variantId: z.string().cuid(),
    quantity: z.number().int().min(1).max(100),
  })).min(1).max(100),
  customerEmail: z.string().trim().email().max(254),
  shippingMethod: z.enum(SHIPPING_METHODS).default('standard'),
})

export async function POST(request: Request) {
  try {
    const parsed = paymentSchema.safeParse(await readJsonBody(request))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payment data' }, { status: 400 })
    }
    const body = parsed.data
    const user = await getRequestUser(request)
    const rateLimit = checkRateLimit(
      `payment:${user?.id || body.customerEmail}`,
      10,
      10 * 60 * 1000,
    )
    if (!rateLimit.allowed) {
      logSecurityEvent('payment_intent_rate_limited', {
        authenticated: Boolean(user),
      })
      return NextResponse.json(
        { error: 'Too many payment attempts' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
        },
      )
    }

    const variantIds = Array.from(new Set(body.items.map((item) => item.variantId)))
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds }, isAvailable: true },
      select: {
        id: true,
        price: true,
      },
    })
    const variantsById = new Map(variants.map((variant) => [variant.id, variant]))
    if (variantsById.size !== variantIds.length) {
      return NextResponse.json({ error: 'One or more products are unavailable' }, { status: 400 })
    }

    const lineItems = body.items.map((item) => {
      const variant = variantsById.get(item.variantId)!
      return { item, variant }
    })
    const subtotal = lineItems.reduce(
      (sum, { item, variant }) => sum + variant.price * item.quantity,
      0,
    )
    const shippingCost = SHIPPING_RATES_CENTS[body.shippingMethod]
    const total = subtotal + shippingCost
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    if (!stripeSecretKey) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Payment service unavailable' }, { status: 503 })
      }
      return NextResponse.json({
        clientSecret: 'pi_mock_' + Date.now(),
        mockPayment: true,
        amount: total,
      })
    }

    const stripe = new Stripe(stripeSecretKey)

    const order = await prisma.order.create({
      data: {
        orderNumber: `PF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        userId: user?.id,
        guestEmail: body.customerEmail,
        status: 'PENDING',
        subtotal,
        tax: 0,
        shippingCost,
        total,
        shippingMethod: body.shippingMethod,
        items: {
          create: lineItems.map(({ item, variant }) => ({
            productVariantId: variant.id,
            quantity: item.quantity,
            unitPrice: variant.price,
            totalPrice: variant.price * item.quantity,
          })),
        },
        payment: {
          create: {
            amount: total,
            currency: 'USD',
            method: 'CREDIT_CARD',
            status: 'PENDING',
          },
        },
      },
    })

    let paymentIntent: Stripe.PaymentIntent
    try {
      paymentIntent = await stripe.paymentIntents.create(
        {
          amount: total,
          currency: 'usd',
          automatic_payment_methods: { enabled: true },
          receipt_email: body.customerEmail,
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
          },
        },
        {
          idempotencyKey: `printframe-order-${order.id}`,
        },
      )

      await prisma.payment.update({
        where: { orderId: order.id },
        data: { stripePaymentId: paymentIntent.id },
      })
    } catch (error) {
      await prisma.payment.update({
        where: { orderId: order.id },
        data: { status: 'FAILED' },
      })
      throw error
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: total,
    })
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Payment error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}
