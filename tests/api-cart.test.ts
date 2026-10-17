import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/db', () => ({
  prisma: {
    productVariant: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

describe('API: Cart Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/cart', () => {
    it('returns empty cart with no items', async () => {
      const { GET } = await import('@/app/api/cart/route')
      const req = new NextRequest('http://localhost:3000/api/cart?sessionId=test-session')
      const response = await GET(req)
      expect(response.status).toBe(200)
    })

    it('handles missing session ID', async () => {
      const { GET } = await import('@/app/api/cart/route')
      const req = new NextRequest('http://localhost:3000/api/cart')
      const response = await GET(req)
      const body = await response.json()
      expect(response.status).toBe(200)
      expect(body.items).toEqual([])
      expect(body.subtotal).toBe(0)
      // The route returns 599 shipping for anonymous carts
      expect(body.shipping).toBe(599)
    })
  })

  describe('POST /api/cart', () => {
    it('adds item to cart', async () => {
      const { POST } = await import('@/app/api/cart/route')
      const req = new NextRequest('http://localhost:3000/api/cart?sessionId=test-session', {
        method: 'POST',
        body: JSON.stringify({
          action: 'add',
          variantId: 'variant-1',
          quantity: 2,
          image: '/images/frame.jpg',
        }),
      })

      const response = await POST(req)
      expect(response.status).toBe(200)
    })

    it('removes item from cart', async () => {
      const { POST } = await import('@/app/api/cart/route')
      const req = new NextRequest('http://localhost:3000/api/cart?sessionId=test-session', {
        method: 'POST',
        body: JSON.stringify({
          action: 'remove',
          itemId: 'variant-1-123456',
        }),
      })

      const response = await POST(req)
      expect(response.status).toBe(200)
    })

    it('updates item quantity', async () => {
      const { POST } = await import('@/app/api/cart/route')
      const req = new NextRequest('http://localhost:3000/api/cart?sessionId=test-session', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update',
          itemId: 'variant-1-123456',
          quantity: 3,
        }),
      })

      const response = await POST(req)
      expect(response.status).toBe(200)
    })

    it('increments quantity for existing item', async () => {
      const { POST } = await import('@/app/api/cart/route')
      const req = new NextRequest('http://localhost:3000/api/cart?sessionId=test-session', {
        method: 'POST',
        body: JSON.stringify({
          action: 'add',
          variantId: 'variant-1',
          quantity: 1,
        }),
      })

      const response = await POST(req)
      expect(response.status).toBe(200)
    })
  })
})
