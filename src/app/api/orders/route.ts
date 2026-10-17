// src/app/api/orders/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Generate order number
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const orderNumber = `PF-${dateStr}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: body.userId,
        guestEmail: body.guestEmail,
        status: 'PENDING',
        subtotal: body.subtotal,
        tax: body.tax,
        shippingCost: body.shipping,
        discount: body.discount || 0,
        total: body.total,
        shippingMethod: body.shippingMethod,
        shippingAddressId: body.shippingAddressId,
        billingAddressId: body.billingAddressId,
        items: {
          create: body.items?.map((item: any) => ({
            productVariantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
            frameConfig: item.frameConfig,
            printSpecs: item.printSpecs,
          })),
        },
        photos: {
          create: body.photos?.map((photo: any) => ({
            originalUrl: photo.originalUrl,
          })),
        },
      },
      include: {
        items: true,
        photos: true,
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Failed to create order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const where: any = {}
    if (userId) where.userId = userId
    if (status) where.status = status

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
