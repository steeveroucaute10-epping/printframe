import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/payments/stripe/route'
import { NextRequest } from 'next/server'

const stripeMocks = vi.hoisted(() => ({
  paymentIntentCreate: vi.fn().mockResolvedValue({
    id: 'pi_test_123',
    client_secret: 'pi_test_secret',
  }),
  paymentUpdate: vi.fn().mockResolvedValue({ id: 'payment-1' }),
}))

vi.mock('stripe', () => ({
  default: class MockStripe {
    paymentIntents = {
      create: stripeMocks.paymentIntentCreate,
    }
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    productVariant: {
      findMany: vi.fn().mockResolvedValue([
        { id: 'clh1234567890abcdefghijk', price: 1299 },
      ]),
    },
    order: {
      create: vi.fn().mockResolvedValue({
        id: 'order-1',
        orderNumber: 'PF-12345678',
      }),
    },
    payment: {
      update: stripeMocks.paymentUpdate,
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  getRequestUser: vi.fn().mockResolvedValue(null),
}))

const { prisma } = await import('@/lib/db')

describe('API: Stripe Payments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key'
  })

  describe('POST /api/payments/stripe', () => {
    it('returns mock response when no Stripe key configured', async () => {
      delete process.env.STRIPE_SECRET_KEY
      const req = new NextRequest('http://localhost:3000/api/payments/stripe', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ variantId: 'clh1234567890abcdefghijk', quantity: 1 }],
          customerEmail: 'test@example.com',
          shippingMethod: 'standard',
        }),
      })
      const response = await POST(req)
      const body = await response.json()
      expect(response.status).toBe(200)
      expect(body.mockPayment).toBe(true)
    })

    it('creates Stripe payment intent when configured', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_key'
      const req = new NextRequest('http://localhost:3000/api/payments/stripe', {
        method: 'POST',
        body: JSON.stringify({
          items: [
            {
              variantId: 'clh1234567890abcdefghijk',
              quantity: 1,
            },
          ],
          customerEmail: 'test@example.com',
          shippingMethod: 'standard',
        }),
      })

      const response = await POST(req)
      expect(response.status).toBe(200)
      expect(stripeMocks.paymentIntentCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 1898,
          currency: 'usd',
          metadata: {
            orderId: 'order-1',
            orderNumber: 'PF-12345678',
          },
        }),
        { idempotencyKey: 'printframe-order-order-1' },
      )
      expect(stripeMocks.paymentUpdate).toHaveBeenCalledWith({
        where: { orderId: 'order-1' },
        data: { stripePaymentId: 'pi_test_123' },
      })
    })

    it('rejects empty carts', async () => {
      const req = new NextRequest('http://localhost:3000/api/payments/stripe', {
        method: 'POST',
        body: JSON.stringify({
          items: [],
          customerEmail: 'test@example.com',
        }),
      })

      const response = await POST(req)
      expect(response.status).toBe(400)
    })
  })
})
