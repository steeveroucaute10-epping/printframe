import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock prisma before importing cart-context
const mockCartSession = {
  id: 'session-1',
  userId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [],
}

const mockCartItems = [
  {
    id: 'item-1',
    sessionId: 'session-1',
    productVariantId: 'variant-1',
    productId: 'product-1',
    size: 'small',
    color: 'black',
    matting: 'white',
    quantity: 2,
    unitPrice: 1000,
    totalPrice: 2000,
  },
]

const mockPrisma = {
  cartSession: {
    create: vi.fn().mockResolvedValue(mockCartSession),
    findUnique: vi.fn().mockResolvedValue(mockCartSession),
  },
  cartItem: {
    findMany: vi.fn().mockResolvedValue(mockCartItems),
    create: vi.fn().mockResolvedValue({
      id: 'new-item',
      sessionId: 'session-1',
      productVariantId: 'variant-1',
      productId: 'product-1',
      size: 'small',
      color: 'black',
      matting: 'white',
      quantity: 3,
      unitPrice: 1500,
      totalPrice: 4500,
    }),
    update: vi.fn().mockImplementation(async (data) => ({
      ...mockCartItems[0],
      ...data.data,
      totalPrice: data.data.quantity * mockCartItems[0].unitPrice,
    })),
    deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
    findUnique: vi.fn().mockResolvedValue(mockCartItems[0]),
    findFirst: vi.fn(),
    delete: vi.fn(),
  },
}

vi.mock('@/lib/db', () => ({
  prisma: mockPrisma,
}))

// Now import the module after mocking
const {
  createCartSession,
  getCartSession,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  getCartTotal,
} = await import('@/lib/cart-context')

describe('cart-context/server-functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: no existing cart item found (first add)
    mockPrisma.cartItem.findFirst.mockResolvedValue(null)
  })

  describe('createCartSession', () => {
    it('creates a new cart session', async () => {
      const result = await createCartSession()
      expect(result.id).toBe('session-1')
      expect(mockPrisma.cartSession.create).toHaveBeenCalledWith({
        data: { items: { create: [] } },
      })
    })

    it('creates session with userId when provided', async () => {
      await createCartSession('user-123')
      expect(mockPrisma.cartSession.create).toHaveBeenCalledWith({
        data: { userId: 'user-123', items: { create: [] } },
      })
    })
  })

  describe('getCartSession', () => {
    it('returns cart session with items', async () => {
      const result = await getCartSession('session-1')
      expect(result?.id).toBe('session-1')
      expect(mockPrisma.cartSession.findUnique).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        include: {
          items: {
            include: {
              product: {
                include: { variants: true },
              },
            },
          },
        },
      })
    })
  })

  describe('addToCart', () => {
    it('creates new cart item when no existing item', async () => {
      const result = await addToCart({
        sessionId: 'session-1',
        productVariantId: 'variant-1',
        productId: 'product-1',
        size: 'small',
        color: 'black',
        matting: 'white',
        quantity: 3,
        unitPrice: 1500,
      })

      expect(result.id).toBe('new-item')
      expect(result.quantity).toBe(3)
      expect(result.totalPrice).toBe(4500) // 3 * 1500
      expect(mockPrisma.cartItem.create).toHaveBeenCalled()
    })

    it('increments quantity when item exists', async () => {
      // Simulate existing item with quantity 2
      mockPrisma.cartItem.findFirst.mockResolvedValue({
        id: 'existing-item',
        sessionId: 'session-1',
        productVariantId: 'variant-1',
        quantity: 2,
        unitPrice: 1000,
      })
      mockPrisma.cartItem.update.mockResolvedValue({
        id: 'existing-item',
        sessionId: 'session-1',
        productVariantId: 'variant-1',
        quantity: 5, // 2 + 3
        unitPrice: 1000,
        totalPrice: 5000,
      })

      const result = await addToCart({
        sessionId: 'session-1',
        productVariantId: 'variant-1',
        productId: 'product-1',
        size: 'small',
        color: 'black',
        matting: 'white',
        quantity: 3,
        unitPrice: 1000,
      })

      expect(result.quantity).toBe(5)
      expect(mockPrisma.cartItem.update).toHaveBeenCalled()
    })
  })

  describe('updateCartItemQuantity', () => {
    beforeEach(() => {
      // Reset the update mock implementation (clearAllMocks doesn't reset resolved values)
      mockPrisma.cartItem.update.mockImplementation(async (data) => ({
        ...mockCartItems[0],
        ...data.data,
        totalPrice: data.data.quantity * mockCartItems[0].unitPrice,
      }))
    })

    it('updates item quantity and recalculates totalPrice', async () => {
      // FindFirst must return the item so updateCartItemQuantity can find it
      mockPrisma.cartItem.findFirst.mockResolvedValue({
        id: 'item-1',
        sessionId: 'session-1',
        productVariantId: 'variant-1',
        quantity: 2,
        unitPrice: 1000,
        totalPrice: 2000,
      })
      
      const result = await updateCartItemQuantity({
        itemId: 'item-1',
        sessionId: 'session-1',
        quantity: 5,
      })
      expect(result.id).toBe('item-1')
      expect(result.quantity).toBe(5)
      expect(result.totalPrice).toBe(5000) // 5 * 1000
      expect(mockPrisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: {
          quantity: 5,
          totalPrice: 5000,
        },
      })
    })

    it('deletes item when quantity is 0 or less', async () => {
      mockPrisma.cartItem.findFirst.mockResolvedValue(mockCartItems[0])
      
      await updateCartItemQuantity({
        itemId: 'item-1',
        sessionId: 'session-1',
        quantity: 0,
      })

      expect(mockPrisma.cartItem.delete).toHaveBeenCalledWith({
        where: {
          id: 'item-1',
          sessionId: 'session-1',
        },
      })
    })

    it('throws error for non-existent item', async () => {
      mockPrisma.cartItem.findFirst.mockResolvedValue(null)
      await expect(
        updateCartItemQuantity({ itemId: 'nonexistent', sessionId: 'session-1', quantity: 3 })
      ).rejects.toThrow('Item not found')
    })
  })

  describe('removeFromCart', () => {
    it('removes item from cart', async () => {
      await removeFromCart('session-1', 'item-1')
      expect(mockPrisma.cartItem.delete).toHaveBeenCalledWith({
        where: {
          id: 'item-1',
          sessionId: 'session-1',
        },
      })
    })
  })

  describe('clearCart', () => {
    it('removes all items from cart', async () => {
      await clearCart('session-1')
      expect(mockPrisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { sessionId: 'session-1' },
      })
    })
  })

  describe('getCartTotal', () => {
    it('calculates correct totals with items', async () => {
      const result = await getCartTotal('session-1')
      expect(result.subtotal).toBe(2000)
      expect(result.totalItems).toBe(2)
      expect(result.shipping).toBe(5.99)
      expect(result.discount).toBe(0)
      expect(result.total).toBe(2005.99)
    })

    it('calculates zero totals for empty cart', async () => {
      mockPrisma.cartItem.findMany.mockResolvedValue([])
      const result = await getCartTotal('empty-session')
      expect(result.subtotal).toBe(0)
      expect(result.totalItems).toBe(0)
      expect(result.shipping).toBe(0)
      expect(result.total).toBe(0)
    })

    it('handles multiple items correctly', async () => {
      const multiItems = [
        { ...mockCartItems[0], quantity: 1, totalPrice: 1000 },
        { ...mockCartItems[0], id: 'item-2', quantity: 2, totalPrice: 3000 },
      ]
      mockPrisma.cartItem.findMany.mockResolvedValue(multiItems)
      
      const result = await getCartTotal('multi-session')
      expect(result.subtotal).toBe(4000) // 1000 + 3000
      expect(result.totalItems).toBe(3) // 1 + 2
      expect(result.total).toBe(4005.99) // 4000 + 5.99 shipping
    })
  })
})
