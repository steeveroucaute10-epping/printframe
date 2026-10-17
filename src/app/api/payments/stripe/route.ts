// src/app/api/payments/stripe/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ''

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, shipping, tax, total, customerEmail, shippingAddress } = body

    if (!STRIPE_SECRET_KEY) {
      console.warn('Stripe not configured - returning mock payment intent')
      // Development mode: return mock response
      return NextResponse.json({
        clientSecret: 'pi_mock_' + Date.now(),
        mockPayment: true,
      })
    }

    // Create Stripe PaymentIntent
    const stripe = require('stripe')(STRIPE_SECRET_KEY)
    
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.variant?.product?.name || 'Frame',
          description: `${item.variant?.size} ${item.variant?.color} ${item.variant?.matting}`,
        },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    }))

    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        sessionId: body.sessionId,
        customerEmail: customerEmail,
      },
    })

    // Create order record
    const order = await prisma.order.create({
      data: {
        orderNumber: `PF-${Date.now().toString().slice(-8)}`,
        guestEmail: customerEmail,
        status: 'PENDING',
        subtotal: body.subtotal || items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0),
        tax: tax,
        shippingCost: shipping,
        total: total,
        shippingMethod: shippingAddress?.method || 'standard',
        items: {
          create: items.map((item: any) => ({
            productVariantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
          })),
        },
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}
