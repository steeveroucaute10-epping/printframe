import { prisma } from "@/lib/db"
import { generateOrderNumber } from "@/lib/utils"
import { z } from "zod"

// ==================== VALIDATION SCHEMAS ====================

const uploadSchema = z.object({
  maxSize: 10 * 1024 * 1024, // 10MB
  acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
})

const orderSchema = z.object({
  shippingMethod: z.enum(["standard", "express", "rush"]),
  shippingAddressId: z.string().min(1),
  billingAddressId: z.string().min(1),
  items: z.array(
    z.object({
      productVariantId: z.string(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
    }),
  ),
  photos: z.array(z.object({ originalUrl: z.string() })),
  guestEmail: z.string().email().optional(),
  userId: z.string().optional(),
})

// ==================== PHOTO UPLOAD ====================

export async function uploadPhoto(file: File, orderId: string) {
  // Validate file
  if (!uploadSchema.parse(file)) {
    throw new Error("Invalid file type or size")
  }

  // TODO(phase-2): Upload to Cloudflare R2 / S3
  // For now, simulate upload with data URL
  const reader = new FileReader()
  const dataUrl = await new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  // Save photo record
  const photo = await prisma.orderPhoto.create({
    data: {
      orderId,
      originalUrl: dataUrl,
      status: "UPLOADED",
    },
  })

  return photo
}

// ==================== PRODUCT QUERIES ====================

export async function getProducts() {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    include: {
      variants: true,
      images: {
        orderBy: { sortOrder: "asc" },
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
        orderBy: { sortOrder: "asc" },
      },
    },
  })
  return product
}

// ==================== ORDER CREATION ====================

export async function createOrder(data: z.infer<typeof orderSchema>) {
  const validated = orderSchema.parse(data)
  const orderNumber = generateOrderNumber()

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: validated.userId,
      guestEmail: validated.guestEmail,
      status: "PENDING",
      subtotal: validated.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
      ),
      tax: 0,
      shippingCost: getShippingCost(validated.shippingMethod),
      discount: 0,
      total: 0, // calculated after tax/shipping
      shippingMethod: validated.shippingMethod,
      shippingAddressId: validated.shippingAddressId,
      billingAddressId: validated.billingAddressId,
      items: {
        create: validated.items.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
        })),
      },
      photos: {
        create: validated.photos,
      },
    },
    include: {
      items: true,
      photos: true,
    },
  })

  // Recalculate total with shipping and tax
  await prisma.order.update({
    where: { id: order.id },
    data: {
      total:
        order.subtotal +
        order.tax +
        order.shippingCost -
        order.discount,
    },
  })

  return order
}

function getShippingCost(method: string): number {
  const rates: Record<string, number> = {
    standard: 5.99,
    express: 12.99,
    rush: 24.99,
  }
  return rates[method] ?? 5.99
}

// ==================== CART ACTIONS ====================

export async function applyDiscountCode(code: string) {
  const discount = await prisma.discountCode.findUnique({
    where: { code },
    where: { code, active: true },
  })

  if (!discount) {
    return { error: "Invalid or expired discount code" }
  }

  if (discount.expiresAt && discount.expiresAt < new Date()) {
    return { error: "This discount code has expired" }
  }

  if (discount.usageLimit && discount.timesUsed >= discount.usageLimit) {
    return { error: "This discount code has reached its usage limit" }
  }

  return { success: true, discount }
}
