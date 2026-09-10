// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const FRAME_SIZES = [
  { label: '4×6', size: '4x6', width: 100, height: 150, price: 2499 },
  { label: '5×7', size: '5x7', width: 120, height: 168, price: 2999 },
  { label: '8×10', size: '8x10', width: 160, height: 200, price: 3999 },
  { label: '11×14', size: '11x14', width: 220, height: 280, price: 5499 },
  { label: '16×20', size: '16x20', width: 280, height: 350, price: 7999 },
] as const

const FRAME_COLORS = [
  { name: 'Matte Black', value: 'MATTE_BLACK', color: '#1f2937' },
  { name: 'White', value: 'WHITE', color: '#ffffff' },
  { name: 'Natural Wood', value: 'NATURAL_WOOD', color: '#d4a574' },
  { name: 'Grey', value: 'GREY', color: '#6b7280' },
] as const

const MATTING_OPTIONS = [
  { label: 'No Matting', value: 'NONE', price: 0 },
  { label: 'White Mat (1")', value: 'WHITE_1_INCH', price: 500 },
  { label: 'White Mat (2")', value: 'WHITE_2_INCH', price: 1000 },
] as const

const UNSPLASH_IMAGES = [
  'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&q=80',
  'https://images.unsplash.com/photo-1506744038136-462732341d64?w=600&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80',
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600&q=80',
  'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&q=80',
  'https://images.unsplash.com/photo-1472120435266-53107fd0c44a?w=600&q=80',
]

async function seed() {
  // Delete existing products + variants (clean slate)
  await prisma.orderItem.deleteMany()
  await prisma.orderPhoto.deleteMany()
  await prisma.order.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()

  // Create main product
  const product = await prisma.product.create({
    data: {
      name: 'Custom Cardboard Photo Frame',
      slug: 'custom-photo-frame',
      description:
        'Premium eco-friendly cardboard frames, precision-sized for your photos. Made from 100% recycled materials with archival-quality printing.',
      basePrice: 2499,
      category: 'frames',
      status: 'ACTIVE',
      seoTitle: 'Custom Photo Frames — PrintFrame',
      seoDescription:
        'Handcrafted cardboard frames with archival prints. 5 sizes, 4 colors. Free shipping over $50.',
    },
  })

  console.log(`Created product: ${product.slug}`)

  // Create all variants (4 colors × 5 sizes × 3 matting = 60 variants)
  for (const color of FRAME_COLORS) {
    for (const size of FRAME_SIZES) {
      for (const matting of MATTING_OPTIONS) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            size: size.size,
            color: color.value,
            matting: matting.value,
            price: size.price + matting.price,
            inventoryCount: 999,
            isAvailable: true,
          },
        })
      }
    }
  }

  console.log(`Created ${FRAME_COLORS.length * FRAME_SIZES.length * MATTING_OPTIONS.length} variants`)

  // Create product images
  for (let i = 0; i < UNSPLASH_IMAGES.length; i++) {
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: UNSPLASH_IMAGES[i],
        altText: `Custom frame preview ${i + 1}`,
        sortOrder: i,
      },
    })
  }

  console.log('Seeded product images')

  // Create some discount codes
  await prisma.discountCode.createMany({
    data: [
      { code: 'WELCOME10', type: 'PERCENTAGE', value: 10, timesUsed: 0, active: true },
      { code: 'FREESHIP', type: 'FREE_SHIPPING', value: 0, timesUsed: 0, active: true },
      { code: 'SAVE15', type: 'PERCENTAGE', value: 15, timesUsed: 0, expiresAt: new Date('2026-12-31'), active: true },
    ],
    skipDuplicates: true,
  })

  console.log('Seeded discount codes')
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
