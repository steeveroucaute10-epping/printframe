import { describe, it, expect, vi, beforeEach } from 'vitest'

// Define mocks at module top level for vi.mock hoisting
const mockOrderFindMany = vi.fn()
const mockOrderCount = vi.fn()
const mockOrderCreate = vi.fn()

vi.mock('@/lib/db', () => ({
  prisma: {
    order: {
      findMany: mockOrderFindMany,
      count: mockOrderCount,
      create: mockOrderCreate,
    },
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

// Import after mocking
const { GET, POST } = await import('@/app/api/orders/route')
import { NextRequest } from 'next/server'

describe('API: Orders Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/orders', () => {
    it('returns orders list', async () => {
      const mockOrders = [
        {
          id: '1',
          orderNumber: 'PF-001',
          status: 'PENDING',
          total: 129900,
          guestEmail: 'test@example.com',
        },
      ]
      
      mockOrderFindMany.mockResolvedValue(mockOrders)
      mockOrderCount.mockResolvedValue(1)

      const req = new NextRequest('http://localhost:3000/api/orders')
      const response = await GET(req)
      const body = await response.json()
      expect(response.status).toBe(200)
      expect(Array.isArray(body.orders)).toBe(true)
      expect(body.orders).toHaveLength(1)
      expect(body.total).toBe(1)
    })

    it('filters by status', async () => {
      mockOrderFindMany.mockResolvedValue([
        {
          id: '1',
          orderNumber: 'PF-001',
          status: 'PENDING',
          total: 129900,
        },
      ])
      mockOrderCount.mockResolvedValue(1)

      const req = new NextRequest('http://localhost:3000/api/orders?status=PENDING')
      const response = await GET(req)
      const body = await response.json()
      expect(body.orders).toHaveLength(1)
      expect(body.orders[0].status).toBe('PENDING')
    })

    it('supports pagination', async () => {
      mockOrderFindMany.mockResolvedValue([])
      mockOrderCount.mockResolvedValue(50)

      const req = new NextRequest('http://localhost:3000/api/orders?limit=20&offset=0')
      const response = await GET(req)
      const body = await response.json()
      expect(response.status).toBe(200)
    })
  })

  describe('POST /api/orders', () => {
    it('creates new order', async () => {
      mockOrderCreate.mockResolvedValue({
        id: 'new-order',
        orderNumber: 'PF-12345678',
        status: 'PENDING',
      })

      const req = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          orderNumber: 'PF-12345678',
          guestEmail: 'test@example.com',
          status: 'PENDING',
          subtotal: 129900,
          tax: 0,
          shippingCost: 599,
          total: 130499,
        }),
      })

      const response = await POST(req)
      expect(response.status).toBe(201)
    })

    it('handles missing optional fields', async () => {
      mockOrderCreate.mockResolvedValue({
        id: 'new-order',
        orderNumber: 'PF-87654321',
        status: 'PENDING',
      })

      const req = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          guestEmail: 'test@example.com',
        }),
      })

      const response = await POST(req)
      expect(response.status).toBe(201)
    })
  })
})
