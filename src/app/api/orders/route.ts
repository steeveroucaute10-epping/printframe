// src/app/api/orders/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getRequestUser, isAdmin } from '@/lib/auth'
import { z } from 'zod'
import type { OrderStatus, Prisma } from '@prisma/client'
import { readJsonBody, RequestBodyError } from '@/lib/request-json'
import { checkRateLimit } from '@/lib/rate-limit'
import { logSecurityEvent } from '@/lib/security-log'
import { SHIPPING_METHODS, SHIPPING_RATES_CENTS } from '@/lib/commerce'

const orderSchema = z.object({
  guestEmail: z.string().trim().email().max(254).optional(),
  shippingMethod: z.enum(SHIPPING_METHODS).default('standard'),
  shippingAddressId: z.string().cuid().optional(),
  billingAddressId: z.string().cuid().optional(),
  items: z.array(z.object({
    variantId: z.string().cuid(),
    quantity: z.number().int().min(1).max(100),
  })).min(1).max(100),
  photos: z.array(z.object({
    originalUrl: z.string().url().max(2048),
  })).max(20).optional().default([]),
})

const orderStatuses = new Set([
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'PRINTING',
  'QUALITY_CHECK',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
])

export async function POST(request: Request) {
  try {
    const parsed = orderSchema.safeParse(await readJsonBody(request, 128 * 1024))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 })
    }

    const body = parsed.data
    const user = await getRequestUser(request)

    if (!user && !body.guestEmail) {
      return NextResponse.json({ error: 'Email is required for guest checkout' }, { status: 400 })
    }
    const rateLimit = checkRateLimit(
      `order:${user?.id || body.guestEmail}`,
      20,
      60 * 60 * 1000,
    )
    if (!rateLimit.allowed) {
      logSecurityEvent('order_creation_rate_limited', {
        authenticated: Boolean(user),
      })
      return NextResponse.json(
        { error: 'Too many order attempts' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
        },
      )
    }

    const addressIds = [body.shippingAddressId, body.billingAddressId].filter(
      (id): id is string => Boolean(id),
    )
    if (addressIds.length > 0) {
      if (!user) {
        return NextResponse.json({ error: 'Saved addresses require authentication' }, { status: 403 })
      }
      const ownedAddressCount = await prisma.address.count({
        where: { id: { in: addressIds }, userId: user.id },
      })
      if (ownedAddressCount !== new Set(addressIds).size) {
        return NextResponse.json({ error: 'Invalid address' }, { status: 403 })
      }
    }

    const variantIds = Array.from(new Set(body.items.map((item) => item.variantId)))
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds }, isAvailable: true },
      select: { id: true, price: true },
    })
    const prices = new Map(variants.map((variant) => [variant.id, variant.price]))
    if (prices.size !== variantIds.length) {
      return NextResponse.json({ error: 'One or more products are unavailable' }, { status: 400 })
    }

    const items = body.items.map((item) => {
      const unitPrice = prices.get(item.variantId)!
      return {
        productVariantId: item.variantId,
        quantity: item.quantity,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
      }
    })
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
    const shippingCost = SHIPPING_RATES_CENTS[body.shippingMethod]
    const total = subtotal + shippingCost
    
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const orderNumber = `PF-${dateStr}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user?.id,
        guestEmail: body.guestEmail,
        status: 'PENDING',
        subtotal,
        tax: 0,
        shippingCost,
        discount: 0,
        total,
        shippingMethod: body.shippingMethod,
        shippingAddressId: body.shippingAddressId,
        billingAddressId: body.billingAddressId,
        items: {
          create: items,
        },
        photos: {
          create: body.photos,
        },
      },
      include: {
        items: true,
        photos: true,
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Failed to create order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const requestedUserId = searchParams.get('userId')
  const requestedLimit = Number.parseInt(searchParams.get('limit') || '20', 10)
  const requestedOffset = Number.parseInt(searchParams.get('offset') || '0', 10)
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 20
  const offset = Number.isFinite(requestedOffset) ? Math.max(requestedOffset, 0) : 0

  try {
    const user = await getRequestUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    if (status && !orderStatuses.has(status)) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 })
    }

    const where: Prisma.OrderWhereInput = {}
    where.userId = isAdmin(user) ? requestedUserId || undefined : user.id
    if (status) where.status = status as OrderStatus

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              productVariant: {
                include: {
                  product: true,
                },
              },
            },
          },
          photos: true,
          payment: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({ orders, total })
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
