import { describe, it, expect, vi, beforeEach } from 'vitest'

// Define mocks at module top level for vi.mock hoisting
const mockOrderFindMany = vi.fn()
const mockOrderCount = vi.fn()
const mockOrderCreate = vi.fn()
const mockVariantFindMany = vi.fn()
const mockAddressCount = vi.fn()
const mockGetRequestUser = vi.fn()

vi.mock('@/lib/db', () => ({
  prisma: {
    order: {
      findMany: mockOrderFindMany,
      count: mockOrderCount,
      create: mockOrderCreate,
    },
    productVariant: {
      findMany: mockVariantFindMany,
    },
    address: {
      count: mockAddressCount,
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  getRequestUser: mockGetRequestUser,
  isAdmin: (user: { role?: string } | null) => user?.role === 'ADMIN',
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
    mockGetRequestUser.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' })
    mockVariantFindMany.mockResolvedValue([
      { id: 'clh1234567890abcdefghijk', price: 1299 },
    ])
    mockAddressCount.mockResolvedValue(0)
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

    it('rejects unauthenticated order reads', async () => {
      mockGetRequestUser.mockResolvedValue(null)
      const req = new NextRequest('http://localhost:3000/api/orders')
      const response = await GET(req)

      expect(response.status).toBe(401)
      expect(mockOrderFindMany).not.toHaveBeenCalled()
    })

    it('scopes customer reads to the authenticated user', async () => {
      mockGetRequestUser.mockResolvedValue({ id: 'customer-1', role: 'CUSTOMER' })
      mockOrderFindMany.mockResolvedValue([])
      mockOrderCount.mockResolvedValue(0)

      await GET(new NextRequest('http://localhost:3000/api/orders?userId=other-user'))

      expect(mockOrderFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'customer-1' } }),
      )
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
          guestEmail: 'test@example.com',
          items: [{
            variantId: 'clh1234567890abcdefghijk',
            quantity: 2,
            price: 1,
          }],
          shippingMethod: 'standard',
        }),
      })

      const response = await POST(req)
      expect(response.status).toBe(201)
      expect(mockOrderCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subtotal: 2598,
            shippingCost: 599,
            total: 3197,
            items: {
              create: [expect.objectContaining({ unitPrice: 1299, totalPrice: 2598 })],
            },
          }),
        }),
      )
    })

    it('rejects missing line items', async () => {
      const req = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          guestEmail: 'test@example.com',
        }),
      })

      const response = await POST(req)
      expect(response.status).toBe(400)
      expect(mockOrderCreate).not.toHaveBeenCalled()
    })
  })
})
