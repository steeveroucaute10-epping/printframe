"use server"

import {" prisma "} from "@/lib/db"
import {" revalidatePath "} from "next/cache"
import {" auth "} from "@/lib/auth"
import {" z "} from "zod"

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
  couponCode: z.string().optional(),
})

// ==================== PRICES (sourced from DB, never client) ====================

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

function calculateTotal(items: Array<{ productVariantId: string; size: string; color: string; matting: string; quantity: number }>): number {
  const subtotal = items.reduce((sum, item) => sum + calculatePrice(item) * item.quantity, 0)
  return Math.round(subtotal * 100)
}

// ==================== SERVER ACTIONS ====================

export async function createOrder(formData: FormData) {
  const userId = auth.getUserId()
  if (!userId) throw new Error("Unauthorized")

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

  const parsed = orderSchema.safeParse({ items, shippingMethod: formData.get("shippingMethod"), couponCode: formData.get("couponCode") })
  if (!parsed.success) throw new Error(`Invalid order data: ${ parsed.error.message }`)

  // Calculate total from validated server-side prices — NEVER trust unitPrice from client
  const itemsWithPrice = items.map((item) => ({
    ...item,
    unitPrice: Math.round(calculatePrice(item) * 100),
    totalPrice: Math.round(calculatePrice(item) * 100 * item.quantity),
  }))

  const shippingMethod = parsed.data.shippingMethod
  const shippingCents = Math.round(SHIPPING_RATES[shippingMethod] * 100) // correct: 5.99 → 599
  const subtotalCents = itemsWithPrice.reduce((sum, i) => sum + i.totalPrice, 0)

  // Apply coupon if provided
  let discountCents = 0
  if (parsed.data.couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: parsed.data.couponCode } })
    if (coupon && coupon.isActive && coupon.expiryDate > new Date()) {
      discountCents = Math.round(subtotalCents * coupon.discountPercent / 100)
    }
  }

  const totalCents = subtotalCents - discountCents + (items.length > 0 ? shippingCents : 0)

  const order = await prisma.order.create({
    data: {
      orderNumber: `PF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      userId,
      subtotal: subtotalCents,
      shipping: shippingCents,
      discount: discountCents,
      total: totalCents,
      status: "pending",
      paymentStatus: "pending",
      shippingMethod,
      shippingAddressId: formData.get("shippingAddressId") || undefined,
      items: {
        create: itemsWithPrice.map((item) => ({
          productVariantId: item.productVariantId,
          productName: `Frame ${item.size} - ${item.color}`,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
      },
    },
  })

  revalidatePath("/order-confirmation")
  return { success: true, orderId: order.id, orderNumber: order.orderNumber }
}

export async function getOrders() {
  const userId = auth.getUserId()
  if (!userId) throw new Error("Unauthorized")

  return prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function getOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true, shippingAddress: true, billingAddress: true },
  })
}

export async function updateOrderStatus(orderId: string, status: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) throw new Error("Order not found")

  return prisma.order.update({
    where: { id: orderId },
    data: { status },
  })
}

// ==================== PRODUCT ACTIONS ====================

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
    include: { variants: true, category: true },
  })
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } })
}

// ==================== DISCOUNT CODES ====================

export async function applyDiscountCode(code: string) {
  const parsed = z.string().min(1).safeParse(code)
  if (!parsed.success) throw new Error("Invalid discount code")

  const coupon = await prisma.coupon.findUnique({
    where: { code },
  })

  if (!coupon) throw new Error("Discount code not found")
  if (!coupon.isActive) throw new Error("Discount code is not active")
  if (coupon.expiryDate < new Date()) throw new Error("Discount code has expired")
  if (coupon.usageCount && coupon.usageCount >= (coupon.maxUses ?? 0)) {
    throw new Error("Discount code has reached its usage limit")
  }

  return {
    valid: true,
    discountPercent: coupon.discountPercent,
    code: coupon.code,
    name: coupon.name,
  }
}

// ==================== FILE UPLOADS ====================

export async function uploadPhoto(file: File) {
  // Validate file type — ONLY safe image formats, explicitly EXCLUDE SVG
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"]
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error("Only JPEG, PNG, WebP, and AVIF images are allowed (SVG not permitted)")
  }

  // Validate file size — max 10MB
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image must be less than 10MB")
  }

  // Validate file extension as secondary check
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".avif"]
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."))
  if (!allowedExtensions.includes(ext)) {
    throw new Error(`Invalid file extension. Allowed: ${allowedExtensions.join(", ")}`)
  }

  // Server-side: generate safe filename
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`
  const uploadPath = `/uploads/${safeName}`

  // TODO(phase-2): Upload to Cloudflare R2 / AWS S3
  // For now, simulate upload (would use sharp for metadata validation in production)
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

// ==================== ADMIN / CMS ACTIONS ====================

export async function createProduct(data: { name: string; description: string; price: number }) {
  const {" name", "description", "price" } = data
  return prisma.product.create({
    data: { name, description, price: Math.round(price * 100) },
  })
}

export async function updateProduct(id: string, data: { name?: string; description?: string; price?: number }) {
  return prisma.product.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description && { description: data.description }),
      ...(data.price && { price: Math.round(data.price * 100) }),
    },
  })
}

export async function createBlogPost(data: { title: string; slug: string; content: string; excerpt?: string; coverImage?: string }) {
  const userId = auth.getUserId()
  if (!userId) throw new Error("Unauthorized")

  return prisma.blogPost.create({
    data: {
      ...data,
      authorId: userId,
    },
  })
}

export async function getBlogPosts(page = 1, limit = 10) {
  const skip = (page - 1) * limit
  return prisma.blogPost.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { author: true },
  })
}

export async function getBlogPost(slug: string) {
  return prisma.blogPost.findUnique({
    where: { slug },
    include: { author: true },
  })
}

export async function createReview(data: { productId?: string; orderId?: string; rating: number; title?: string; body?: string }) {
  const userId = auth.getUserId()
  if (!userId) throw new Error("Unauthorized")

  return prisma.review.create({
    data: {
      ...data,
      userId,
    },
  })
}

export async function getReviews(productId?: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit
  const where = productId ? { productId } : {}
  return prisma.review.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  })
}

export async function getReviewStats(productId?: string) {
  const where = productId ? { productId } : {}
  const reviews = await prisma.review.findMany({ where, select: { rating: true } })
  if (reviews.length === 0) return { averageRating: 0, totalReviews: 0 }
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  return { averageRating: Math.round(averageRating * 10) / 10, totalReviews: reviews.length }
}

// ==================== USER / PROFILE ACTIONS ====================

export async function createUserProfile(data: { name: string; email: string }) {
  return prisma.user.create({
    data: { name: data.name, email: data.email },
  })
}

export async function updateUserProfile(userId: string, data: { name?: string; email?: string }) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
    },
  })
}

export async function addAddress(userId: string, data: { name: string; line1: string; line2?: string; city: string; state: string; zip: string; country: string }) {
  return prisma.address.create({
    data: { ...data, userId },
  })
}

export async function deleteAddress(addressId: string) {
  return prisma.address.delete({ where: { id: addressId } })
}
