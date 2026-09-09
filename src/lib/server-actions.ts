import { prisma } from '@/lib/db'

export async function getProducts() {
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    include: {
      variants: true,
      images: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })
  return products
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      variants: true,
      images: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })
  return product
}

export async function createOrder(data: {
  orderNumber: string
  userId?: string
  guestEmail?: string
  status: string
  subtotal: number
  tax: number
  shippingCost: number
  discount: number
  total: number
  shippingMethod: string
  shippingAddressId: string
  billingAddressId: string
  items: { productVariantId: string; quantity: number; unitPrice: number }[]
  photos: { originalUrl: string }[]
}) {
  const order = await prisma.order.create({
    data: {
      orderNumber: data.orderNumber,
      userId: data.userId,
      guestEmail: data.guestEmail,
      status: data.status,
      subtotal: data.subtotal,
      tax: data.tax,
      shippingCost: data.shippingCost,
      discount: data.discount,
      total: data.total,
      shippingMethod: data.shippingMethod,
      shippingAddressId: data.shippingAddressId,
      billingAddressId: data.billingAddressId,
      items: {
        create: data.items.map(item => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
        })),
      },
      photos: {
        create: data.photos,
      },
    },
    include: {
      items: true,
      photos: true,
    },
  })
  return order
}
