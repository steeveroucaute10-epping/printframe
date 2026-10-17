// src/app/api/products/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getRequestUser, isAdmin } from '@/lib/auth'
import { z } from 'zod'
import { readJsonBody, RequestBodyError } from '@/lib/request-json'

const productSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(200),
  description: z.string().max(10_000).optional(),
  basePrice: z.number().int().nonnegative().max(100_000_000),
  category: z.string().trim().min(1).max(100).default('frames'),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const requestedLimit = Number.parseInt(searchParams.get('limit') || '20', 10)
  const requestedOffset = Number.parseInt(searchParams.get('offset') || '0', 10)
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 20
  const offset = Number.isFinite(requestedOffset) ? Math.max(requestedOffset, 0) : 0

  try {
    const where = category
      ? { category, status: 'ACTIVE' as const }
      : { status: 'ACTIVE' as const }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          variants: true,
          images: { orderBy: { sortOrder: 'asc' } },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json(
      { products, total },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      },
    )
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getRequestUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const parsed = productSchema.safeParse(await readJsonBody(request))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid product data' }, { status: 400 })
    }
    const body = parsed.data
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        basePrice: body.basePrice,
        category: body.category,
        status: body.status,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
      },
    })
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Failed to create product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
