// src/app/api/cart/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface CartItem {
  id: string
  variantId: string
  quantity: number
  image?: string
}

interface Cart {
  items: CartItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId') || 'anonymous'

  if (!sessionId) {
    return NextResponse.json({ items: [], subtotal: 0, shipping: 0, tax: 0, total: 0 })
  }

  try {
    const items = JSON.parse(sessionStorage.getItem('cart') || '[]')
    
    // Calculate totals
    let subtotal = 0
    const enrichedItems = await Promise.all(
      items.map(async (item: CartItem) => {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        })
        if (variant) {
          subtotal += variant.price * item.quantity
        }
        return {
          ...item,
          variant,
          price: variant?.price || 0,
        }
      })
    )

    const shipping = subtotal > 5000 ? 0 : 599 // Free shipping over $50
    const tax = Math.round(subtotal * 0.08) // 8% tax estimate
    const total = subtotal + shipping + tax

    return NextResponse.json({
      items: enrichedItems,
      subtotal,
      shipping,
      tax,
      total,
    })
  } catch (error) {
    console.error('Failed to fetch cart:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId') || 'anonymous'

  try {
    const body = await request.json()
    const items = JSON.parse(sessionStorage.getItem('cart') || '[]')

    if (body.action === 'add') {
      const existingIndex = items.findIndex((item: CartItem) => item.variantId === body.variantId)
      if (existingIndex >= 0) {
        items[existingIndex].quantity += body.quantity || 1
      } else {
        items.push({
          id: body.variantId + '-' + Date.now(),
          variantId: body.variantId,
          quantity: body.quantity || 1,
          image: body.image,
        })
      }
    } else if (body.action === 'remove') {
      const index = items.findIndex((item: CartItem) => item.id === body.itemId)
      if (index >= 0) {
        items.splice(index, 1)
      }
    } else if (body.action === 'update') {
      const item = items.find((item: CartItem) => item.id === body.itemId)
      if (item) {
        item.quantity = Math.max(1, body.quantity)
      }
    }

    sessionStorage.setItem('cart', JSON.stringify(items))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update cart:', error)
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
  }
}
