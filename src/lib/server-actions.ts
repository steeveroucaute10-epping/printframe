"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { OrderStatus } from "@prisma/client"
import { z } from "zod"

// ==================== VALIDATION ====================

const orderSchema = z.object({
  items: z.array(z.object({
    productVariantId: z.string(),
    size: z.string(),
    color: z.string(),
    matting: z.string(),
    quantity: z.number().int().positive(),
  })),
  shippingMethod: z.enum(["standard", "express", "rush"]),
  shippingAddressId: z.string().optional(),
  discountCode: z.string().optional(),
})

// ==================== PRICES (stubbed — replace with DB queries in phase 2) ====================

const FRAME_PRICES: Record<string, number> = {
  "4x6": 15.99,
  "5x7": 19.99,
  "8x10": 24.99,
  "11x14": 34.99,
  "16x20": 44.99,
  "24x36": 59.99,
}

const SHIPPING_RATES: Record<string, number> = {
  standard: 5.99,
  express: 12.99,
  rush: 24.99,
}

const ADDON_PRICES: Record<string, number> = {
  "white-1": 4.99,
  "white-2": 4.99,
  "paper-mount": 4.99,
  "foam-board": 7.99,
  "acrylic-face": 12.99,
}

function calculatePrice(item: { productVariantId: string; size: string; color: string; matting: string }): number {
  const base = FRAME_PRICES[item.size] ?? 0
  const matting = item.matting !== "none" ? ADDON_PRICES[item.matting] ?? 0 : 0
  return base + matting
}

// ==================== SERVER ACTIONS ====================

export async function createOrder(formData: FormData) {
  // TODO(phase-2): Add real auth check via session
  const userId = "stub-user-id"

  // Parse and validate items from FormData
  const itemsRaw = formData.get("items")
  if (!itemsRaw) throw new Error("No items in order")

  const items = JSON.parse(itemsRaw as string).map((item: any) => ({
    productVariantId: item.productVariantId,
    size: item.size,
    color: item.color,
    matting: item.matting,
    quantity: Number(item.quantity),
  }))

  const parsed = orderSchema.safeParse({
    items,
    shippingMethod: formData.get("shippingMethod"),
    discountCode: formData.get("discountCode"),
  })
  if (!parsed.success) throw new Error(`Invalid order data: ${parsed.error.message}`)

  // Calculate total from validated server-side prices — NEVER trust unitPrice from client
  const itemsWithPrice = items.map((item) => ({
    ...item,
    unitPrice: Math.round(calculatePrice(item) * 100),
    totalPrice: Math.round(calculatePrice(item) * 100 * item.quantity),
  }))

  const shippingMethod = parsed.data.shippingMethod
  const shippingCostCents = Math.round(SHIPPING_RATES[shippingMethod] * 100)
  const subtotalCents = itemsWithPrice.reduce((sum, i) => sum + i.totalPrice, 0)

  // Apply discount code if provided
  let discountCents = 0
  if (parsed.data.discountCode) {
    const discountCode = await prisma.discountCode.findUnique({
      where: { code: parsed.data.discountCode },
    })
    if (
      discountCode &&
      discountCode.active &&
      (!discountCode.expiresAt || discountCode.expiresAt > new Date())
    ) {
      discountCents = Math.round(subtotalCents * discountCode.value / 100)
    }
  }

  const totalCents =
    subtotalCents - discountCents + (items.length > 0 ? shippingCostCents : 0)

  const order = await prisma.order.create({
    data: {
      orderNumber: `PF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      userId,
      subtotal: subtotalCents,
      shippingCost: shippingCostCents,
      discount: discountCents,
      total: totalCents,
      status: OrderStatus.PENDING,
      shippingMethod,
      shippingAddressId: (formData.get("shippingAddressId") as string) || undefined,
      items: {
        create: itemsWithPrice.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          frameConfig: null,
          printSpecs: null,
        })),
      },
    },
  })

  revalidatePath("/order-confirmation")
  return { success: true, orderId: order.id, orderNumber: order.orderNumber }
}

export async function getOrders() {
  // TODO(phase-2): Add real auth check via session
  const userId = "stub-user-id"

  return prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function getOrder(id: string) {
  // TODO(phase-2): Add auth check
  return prisma.order.findUnique({
    where: { id },
    include: { items: true },
  })
}

// ==================== PRODUCT ACTIONS ====================

export async function getProducts() {
  return prisma.product.findMany({
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { variants: true },
  })
}

export async function searchProducts(query: string) {
  if (!query || query.length < 2) return []

  return prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 10,
    include: { variants: true },
  })
}

export async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  })
}

// ==================== DISCOUNT CODES ====================

export async function applyDiscountCode(code: string) {
  const parsed = z.string().min(1).safeParse(code)
  if (!parsed.success) throw new Error("Invalid discount code")

  const discountCode = await prisma.discountCode.findUnique({
    where: { code },
  })

  if (!discountCode) throw new Error("Discount code not found")
  if (!discountCode.active) throw new Error("Discount code is not active")
  if (discountCode.expiresAt && discountCode.expiresAt < new Date()) {
    throw new Error("Discount code has expired")
  }
  if (
    discountCode.usageLimit !== null &&
    discountCode.timesUsed >= discountCode.usageLimit
  ) {
    throw new Error("Discount code has reached its usage limit")
  }

  return {
    valid: true,
    discountPercent: discountCode.value,
    code: discountCode.code,
  }
}

// ==================== FILE UPLOADS ====================

export async function uploadPhoto(file: File) {
  // Validate file type — ONLY safe image formats, explicitly EXCLUDE SVG
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"]
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error(
      "Only JPEG, PNG, WebP, and AVIF images are allowed (SVG not permitted)",
    )
  }

  // Validate file size — max 10MB
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image must be less than 10MB")
  }

  // Validate file extension as secondary check
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".avif"]
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."))
  if (!allowedExtensions.includes(ext)) {
    throw new Error(
      `Invalid file extension. Allowed: ${allowedExtensions.join(", ")}`,
    )
  }

  // Server-side: generate safe filename
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`
  const uploadPath = `/uploads/${safeName}`

  // TODO(phase-2): Upload to Cloudflare R2 / AWS S3
  console.log(`File uploaded: ${safeName} (${file.type}, ${file.size} bytes)`)

  return {
    success: true,
    fileName: safeName,
    fileSize: file.size,
    mimeType: file.type,
    path: uploadPath,
  }
}

export async function uploadProductImage(file: File) {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"]
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error("Only JPEG, PNG, WebP, and AVIF images are allowed")
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Product image must be less than 5MB")
  }

  const safeName = `product-${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`
  console.log(`Product image uploaded: ${safeName}`)

  return {
    success: true,
    fileName: safeName,
    fileSize: file.size,
    mimeType: file.type,
  }
}

// ==================== END SERVER ACTIONS ====================
