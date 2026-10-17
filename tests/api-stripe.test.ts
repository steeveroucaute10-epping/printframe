import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/payments/stripe/route'
import { NextRequest } from 'next/server'

vi.mock('stripe', () => ({
  default: vi.fn(() => ({
    paymentIntents: {
      create: vi.fn().mockResolvedValue({
        client_secret: 'pi_test_123',
      }),
    },
  })),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    order: {
      create: vi.fn().mockResolvedValue({
        id: 'order-1',
        orderNumber: 'PF-12345678',
      }),
    },
  },
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
          items: [{ price: 100, quantity: 1 }],
          total: 100,
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
              price: 1299,
              quantity: 1,
              variant: {
                product: { name: 'Standard Frame' },
                size: 'Small',
                color: 'Black',
                matting: 'White',
              },
            },
          ],
          shipping: 5.99,
          tax: 0,
          total: 1304.99,
          customerEmail: 'test@example.com',
          subtotal: 1299,
          sessionId: 'session-1',
        }),
      })

      const response = await POST(req)
      expect(response.status).toBe(200)
    })

    it('handles empty items gracefully', async () => {
      const req = new NextRequest('http://localhost:3000/api/payments/stripe', {
        method: 'POST',
        body: JSON.stringify({
          items: [],
          shipping: 0,
          tax: 0,
          total: 0,
        }),
      })

      const response = await POST(req)
      expect(response.status).toBe(200)
    })
  })
})
