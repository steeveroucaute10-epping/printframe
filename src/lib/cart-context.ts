// src/lib/cart-context.ts
/**
 * Server-side cart utility functions
 * These functions work with the Prisma database directly
 */

import { prisma } from '@/lib/db'

export interface CartItem {
  id: string
  productVariantId: string
  productId: string
  size: string
  color: string
  matting: string
  quantity: number
  unitPrice: number
  totalPrice: number
  name?: string
}

export async function createCartSession(userId?: string) {
  const session = await prisma.cartSession.create({
    data: {
      ...(userId ? { userId } : {}),
      items: {
        create: [],
      },
    },
  })
  return session
}

export async function getCartSession(sessionId: string) {
  return prisma.cartSession.findUnique({
    where: { id: sessionId },
    include: {
      items: {
        include: {
          product: {
            include: {
              variants: true,
            },
          },
        },
      },
    },
  })
}

export async function addToCart(params: {
  sessionId: string
  productVariantId: string
  quantity: number
  productId: string
  name?: string
  size?: string
  color?: string
  matting?: string
  unitPrice: number
}) {
  const { sessionId, productVariantId, quantity, productId, name, size, color, matting, unitPrice } = params
  
  // Check if item already exists
  const existingItem = await prisma.cartItem.findFirst({
    where: {
      sessionId,
      productVariantId,
      size: size ?? '',
      color: color ?? '',
      matting: matting ?? '',
    },
  })

  if (existingItem) {
    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    })
  }

  return prisma.cartItem.create({
    data: {
      sessionId,
      productVariantId,
      quantity,
      productId,
      name: name ?? '',
      size: size ?? '',
      color: color ?? '',
      matting: matting ?? '',
      unitPrice,
      totalPrice: quantity * unitPrice,
    },
  })
}

export async function removeFromCart(sessionId: string, itemId: string) {
  return prisma.cartItem.delete({
    where: {
      id: itemId,
      sessionId,
    },
  })
}

export async function updateCartItemQuantity(params: {
  sessionId: string
  itemId: string
  quantity: number
}) {
  const { sessionId, itemId, quantity } = params
  
  if (quantity <= 0) {
    return prisma.cartItem.delete({
      where: {
        id: itemId,
        sessionId,
      },
    })
  }

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, sessionId },
  })

  if (!item) {
    throw new Error('Item not found')
  }

  return prisma.cartItem.update({
    where: { id: itemId },
    data: {
      quantity,
      totalPrice: quantity * item.unitPrice,
    },
  })
}

export async function clearCart(sessionId: string) {
  await prisma.cartItem.deleteMany({
    where: { sessionId },
  })
}

export async function getCartTotal(sessionId: string) {
  const items = await prisma.cartItem.findMany({
    where: { sessionId },
  })

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  // Calculate shipping
  const shippingMethods: Record<string, number> = {
    standard: 5.99,
    express: 12.99,
    rush: 24.99,
  }

  const shipping = items.length > 0 ? shippingMethods.standard : 0
  
  // Apply discount if exists
  const discountPercent = 0 // Could be fetched from discount code

  const discount = subtotal * (discountPercent / 100)
  const total = Math.max(0, subtotal - discount + shipping)

  return {
    subtotal,
    shipping,
    discount,
    total,
    totalItems,
    items,
  }
}
