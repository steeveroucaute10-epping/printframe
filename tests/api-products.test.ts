import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/products/route'
import { NextRequest } from 'next/server'

// Use factory function to avoid hoisting issues
vi.mock('@/lib/db', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

// Access the mocks after import
const { prisma } = await import('@/lib/db')

describe('API: Products Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/products', () => {
    it('returns products list', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Standard Frame',
          slug: 'standard-frame',
          description: 'A nice frame',
          basePrice: 1299,
          category: 'frames',
          status: 'ACTIVE',
          variants: [{ id: 'v1', size: 'Small', color: 'Black', unitPrice: 1299 }],
          images: [],
        },
        {
          id: '2',
          name: 'Metal Frame',
          slug: 'metal-frame',
          description: 'A metal frame',
          basePrice: 1499,
          category: 'frames',
          status: 'ACTIVE',
          variants: [{ id: 'v2', size: 'Medium', color: 'Silver', unitPrice: 1499 }],
          images: [],
        },
      ]
      
      prisma.product.findMany.mockResolvedValue(mockProducts)
      prisma.product.count.mockResolvedValue(2)

      const req = new NextRequest('http://localhost:3000/api/products')
      const response = await GET(req)
      const body = await response.json()
      expect(response.status).toBe(200)
      expect(Array.isArray(body.products)).toBe(true)
      expect(body.products).toHaveLength(2)
      expect(body.total).toBe(2)
    })

    it('filters by category', async () => {
      prisma.product.findMany.mockResolvedValue([
        {
          id: '1',
          name: 'Frame',
          slug: 'frame',
          description: 'A frame',
          basePrice: 1299,
          category: 'frames',
          status: 'ACTIVE',
          variants: [],
          images: [],
        },
      ])
      prisma.product.count.mockResolvedValue(1)

      const req = new NextRequest('http://localhost:3000/api/products?category=frames')
      const response = await GET(req)
      const body = await response.json()
      expect(body.products).toHaveLength(1)
      expect(body.products[0].category).toBe('frames')
    })

    it('supports pagination', async () => {
      prisma.product.findMany.mockResolvedValue([])
      prisma.product.count.mockResolvedValue(10)

      const req = new NextRequest('http://localhost:3000/api/products?limit=5&offset=5')
      const response = await GET(req)
      const body = await response.json()
      expect(response.status).toBe(200)
    })

    it('returns empty array when no products match', async () => {
      prisma.product.findMany.mockResolvedValue([])
      prisma.product.count.mockResolvedValue(0)

      const req = new NextRequest('http://localhost:3000/api/products?category=nonexistent')
      const response = await GET(req)
      const body = await response.json()
      expect(body.products).toEqual([])
    })
  })
})
