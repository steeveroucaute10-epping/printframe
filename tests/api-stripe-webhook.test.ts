import { beforeEach, describe, expect, it, vi } from 'vitest'
import Stripe from 'stripe'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  orderFindUnique: vi.fn(),
  orderUpdateMany: vi.fn(),
  paymentUpdateMany: vi.fn(),
  transaction: vi.fn(),
  securityLog: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    order: {
      findUnique: mocks.orderFindUnique,
      updateMany: mocks.orderUpdateMany,
    },
    payment: {
      updateMany: mocks.paymentUpdateMany,
    },
    $transaction: mocks.transaction,
  },
}))

vi.mock('@/lib/security-log', () => ({
  logSecurityEvent: mocks.securityLog,
}))

const { POST } = await import('@/app/api/payments/stripe/webhook/route')

const webhookSecret = 'whsec_test_printframe'

function eventPayload(amountReceived = 1898) {
  return JSON.stringify({
    id: 'evt_test_success',
    object: 'event',
    api_version: '2024-06-20',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: 'pi_test_order_1',
        object: 'payment_intent',
        amount: 1898,
        amount_received: amountReceived,
        currency: 'usd',
        metadata: {
          orderId: 'order-1',
          orderNumber: 'PF-TEST-1',
        },
        status: 'succeeded',
      },
    },
    livemode: false,
    pending_webhooks: 1,
    request: null,
    type: 'payment_intent.succeeded',
  })
}

function webhookRequest(payload: string, signature?: string) {
  return new NextRequest('http://localhost:3000/api/payments/stripe/webhook', {
    method: 'POST',
    headers: signature ? { 'stripe-signature': signature } : undefined,
    body: payload,
  })
}

describe('API: Stripe webhook', () => {
  let order: {
    id: string
    total: number
    status: string
    payment: {
      id: string
      amount: number
      currency: string
      status: string
      stripePaymentId: string | null
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.STRIPE_WEBHOOK_SECRET = webhookSecret
    delete process.env.STRIPE_SECRET_KEY

    order = {
      id: 'order-1',
      total: 1898,
      status: 'PENDING',
      payment: {
        id: 'payment-1',
        amount: 1898,
        currency: 'USD',
        status: 'PENDING',
        stripePaymentId: 'pi_test_order_1',
      },
    }

    mocks.orderFindUnique.mockImplementation(async () => order)
    mocks.orderUpdateMany.mockImplementation(async () => {
      if (order.status !== 'PENDING') return { count: 0 }
      order.status = 'CONFIRMED'
      return { count: 1 }
    })
    mocks.paymentUpdateMany.mockImplementation(async () => {
      order.payment.status = 'COMPLETED'
      return { count: 1 }
    })
    mocks.transaction.mockImplementation(async (operation) => {
      if (typeof operation === 'function') {
        return operation({
          order: { updateMany: mocks.orderUpdateMany },
          payment: { updateMany: mocks.paymentUpdateMany },
        })
      }
      return Promise.all(operation)
    })
  })

  it('confirms an order only after a valid signed success event', async () => {
    const payload = eventPayload()
    const signature = Stripe.webhooks.generateTestHeaderString({
      payload,
      secret: webhookSecret,
    })

    const response = await POST(webhookRequest(payload, signature))

    expect(response.status).toBe(200)
    expect(order.status).toBe('CONFIRMED')
    expect(order.payment.status).toBe('COMPLETED')
    expect(mocks.transaction).toHaveBeenCalledOnce()
  })

  it('rejects an invalid signature before database access', async () => {
    const response = await POST(webhookRequest(eventPayload(), 'invalid'))

    expect(response.status).toBe(400)
    expect(mocks.orderFindUnique).not.toHaveBeenCalled()
    expect(mocks.securityLog).toHaveBeenCalledWith('stripe_webhook_invalid_signature')
  })

  it('rejects oversized webhook bodies before signature processing', async () => {
    const response = await POST(webhookRequest('x'.repeat(1024 * 1024 + 1), 'invalid'))

    expect(response.status).toBe(413)
    expect(mocks.orderFindUnique).not.toHaveBeenCalled()
    expect(mocks.securityLog).not.toHaveBeenCalled()
  })

  it('treats a replayed success event as an idempotent duplicate', async () => {
    const payload = eventPayload()
    const signature = Stripe.webhooks.generateTestHeaderString({
      payload,
      secret: webhookSecret,
    })

    expect((await POST(webhookRequest(payload, signature))).status).toBe(200)
    const replay = await POST(webhookRequest(payload, signature))
    const replayBody = await replay.json()

    expect(replay.status).toBe(200)
    expect(replayBody.duplicate).toBe(true)
    expect(mocks.transaction).toHaveBeenCalledOnce()
  })

  it('rejects amount mismatches without changing order state', async () => {
    const payload = eventPayload(1)
    const signature = Stripe.webhooks.generateTestHeaderString({
      payload,
      secret: webhookSecret,
    })

    const response = await POST(webhookRequest(payload, signature))

    expect(response.status).toBe(400)
    expect(order.status).toBe('PENDING')
    expect(order.payment.status).toBe('PENDING')
    expect(mocks.transaction).not.toHaveBeenCalled()
    expect(mocks.securityLog).toHaveBeenCalledWith(
      'stripe_webhook_payment_mismatch',
      expect.objectContaining({ orderId: 'order-1' }),
    )
  })
})
