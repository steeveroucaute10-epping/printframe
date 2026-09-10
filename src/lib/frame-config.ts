// Frame configuration constants and utilities

export interface FrameSizeConfig {
  width: number
  height: number
  label: string
  dimensions: string
  aspectRatio: string
  price: number
  minImageWidth: number
  minImageHeight: number
}

export interface ProductConfig {
  name: string
  description: string
  dimensions: string
  material: string
  finish: string
  basePrice: number
  features: string[]
  image: string
}

export interface FrameConfig {
  productType: string
  frameSize: string
  frameColor: string
  matting: string
  glassType: string
  imageUrl: string
  imageWidth: number
  imageHeight: number
}

export interface ValidationResponse {
  isValid: boolean
  errors: string[]
}

const FRAME_SIZES: Record<string, FrameSizeConfig> = {
  Small: {
    width: 400,
    height: 480,
    label: 'Small',
    dimensions: '8" × 10"',
    aspectRatio: '4:5',
    price: 1299,
    minImageWidth: 800,
    minImageHeight: 1000,
  },
  Medium: {
    width: 450,
    height: 540,
    label: 'Medium',
    dimensions: '11" × 14"',
    aspectRatio: '5:6',
    price: 1599,
    minImageWidth: 1100,
    minImageHeight: 1400,
  },
  Large: {
    width: 500,
    height: 600,
    label: 'Large',
    dimensions: '16" × 20"',
    aspectRatio: '4:5',
    price: 1999,
    minImageWidth: 1600,
    minImageHeight: 2000,
  },
  'Extra Large': {
    width: 550,
    height: 660,
    label: 'Extra Large',
    dimensions: '20" × 24"',
    aspectRatio: '5:6',
    price: 2499,
    minImageWidth: 2000,
    minImageHeight: 2400,
  },
}

const PRODUCT_CONFIGS: Record<string, ProductConfig> = {
  standard: {
    name: 'Standard Frame',
    description: 'Classic wooden frame with glass',
    dimensions: '8" × 10"',
    material: 'Wood',
    finish: 'Natural',
    basePrice: 1299,
    features: ['Glass front', 'Wood frame', 'Hanging hardware included'],
    image: '/products/standard-frame.jpg',
  },
  metal: {
    name: 'Metal Frame',
    description: 'Sleek metal frame with modern finish',
    dimensions: '8" × 10"',
    material: 'Metal',
    finish: 'Brushed Nickel',
    basePrice: 1499,
    features: ['Tempered glass', 'Metal frame', 'Modern design'],
    image: '/products/metal-frame.jpg',
  },
  rustic: {
    name: 'Rustic Frame',
    description: 'Weathered wood frame with vintage appeal',
    dimensions: '8" × 10"',
    material: 'Reclaimed Wood',
    finish: 'Distressed Brown',
    basePrice: 1399,
    features: ['Reclaimed wood', 'Vintage finish', 'Handcrafted'],
    image: '/products/rustic-frame.jpg',
  },
}

const FRAME_COLORS = [
  { value: 'black', label: 'Black' },
  { value: 'white', label: 'White' },
  { value: 'natural', label: 'Natural' },
  { value: 'dark-oak', label: 'Dark Oak' },
  { value: 'silver', label: 'Silver' },
  { value: 'matte-black', label: 'Matte Black' },
]

const MATTING_OPTIONS = [
  { value: 'none', label: 'No Matting' },
  { value: 'white', label: 'White' },
  { value: 'black', label: 'Black' },
  { value: 'cream', label: 'Cream' },
]

const GLASS_OPTIONS = [
  { value: 'standard', label: 'Standard Glass' },
  { value: 'anti-glare', label: 'Anti-Glare Glass' },
  { value: 'uv-protective', label: 'UV Protective' },
]

export function getFrameConfig(size: string): FrameSizeConfig {
  const config = FRAME_SIZES[size]
  if (!config) {
    throw new Error(`Unknown frame size: ${size}`)
  }
  return config
}

export function getProductConfig(type: string): ProductConfig {
  const config = PRODUCT_CONFIGS[type]
  if (!config) {
    throw new Error(`Unknown product type: ${type}`)
  }
  return config
}

export function getCustomFrameConfig(config: {
  width: string
  height: string
  material: string
  finish: string
  matting: string
}): ProductConfig {
  const features = ['Custom dimensions', `Your choice of material`]
  if (config.matting === 'None') {
    features.push('No matting')
  } else {
    features.push('Matting included')
  }

  return {
    name: 'Custom Frame',
    description: 'Custom-sized frame with your specifications',
    dimensions: 'Custom',
    material: config.material,
    finish: config.finish,
    basePrice: 1599,
    features,
    image: '/products/custom-frame.jpg',
  }
}

export function getFrameColors() {
  return FRAME_COLORS
}

export function getMattingOptions() {
  return MATTING_OPTIONS
}

export function getGlassOptions() {
  return GLASS_OPTIONS
}

export function validateFrameConfig(config: FrameConfig): ValidationResponse {
  const errors: string[] = []

  if (!config.imageUrl || config.imageUrl.trim() === '') {
    errors.push('Image URL is required')
  }

  if (config.imageWidth < 400 || config.imageHeight < 400) {
    errors.push('Image dimensions too small')
  }

  const validProductTypes = ['standard', 'metal', 'rustic', 'custom']
  if (!validProductTypes.includes(config.productType)) {
    errors.push('Invalid product type')
  }

  const validSizes = Object.keys(FRAME_SIZES)
  if (!validSizes.includes(config.frameSize)) {
    errors.push('Invalid frame size')
  }

  const validColors = FRAME_COLORS.map((c) => c.value)
  if (!validColors.includes(config.frameColor)) {
    errors.push('Invalid frame color')
  }

  const validMatting = MATTING_OPTIONS.map((m) => m.value)
  if (!validMatting.includes(config.matting)) {
    errors.push('Invalid matting')
  }

  const validGlass = GLASS_OPTIONS.map((g) => g.value)
  if (!validGlass.includes(config.glassType)) {
    errors.push('Invalid glass type')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
