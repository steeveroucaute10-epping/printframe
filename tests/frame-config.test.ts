import { describe, it, expect } from 'vitest'
import {
  getFrameConfig,
  getProductConfig,
  getCustomFrameConfig,
  validateFrameConfig,
} from '@/lib/frame-config'

describe('frame-config/getFrameConfig', () => {
  it('returns correct config for small frame', () => {
    const config = getFrameConfig('Small')
    expect(config).toEqual({
      width: 400,
      height: 480,
      label: 'Small',
      dimensions: '8" × 10"',
      aspectRatio: '4:5',
      price: 1299,
      minImageWidth: 800,
      minImageHeight: 1000,
    })
  })

  it('returns correct config for medium frame', () => {
    const config = getFrameConfig('Medium')
    expect(config).toEqual({
      width: 450,
      height: 540,
      label: 'Medium',
      dimensions: '11" × 14"',
      aspectRatio: '5:6',
      price: 1599,
      minImageWidth: 1100,
      minImageHeight: 1400,
    })
  })

  it('returns correct config for large frame', () => {
    const config = getFrameConfig('Large')
    expect(config).toEqual({
      width: 500,
      height: 600,
      label: 'Large',
      dimensions: '16" × 20"',
      aspectRatio: '4:5',
      price: 1999,
      minImageWidth: 1600,
      minImageHeight: 2000,
    })
  })

  it('returns correct config for extra large frame', () => {
    const config = getFrameConfig('Extra Large')
    expect(config).toEqual({
      width: 550,
      height: 660,
      label: 'Extra Large',
      dimensions: '20" × 24"',
      aspectRatio: '5:6',
      price: 2499,
      minImageWidth: 2000,
      minImageHeight: 2400,
    })
  })

  it('throws error for unknown size', () => {
    expect(() => getFrameConfig('Unknown' as any)).toThrow()
  })
})

describe('frame-config/getProductConfig', () => {
  it('returns correct config for standard frame', () => {
    const config = getProductConfig('standard')
    expect(config).toEqual({
      name: 'Standard Frame',
      description: 'Classic wooden frame with glass',
      dimensions: '8" × 10"',
      material: 'Wood',
      finish: 'Natural',
      basePrice: 1299,
      features: ['Glass front', 'Wood frame', 'Hanging hardware included'],
      image: '/products/standard-frame.jpg',
    })
  })

  it('returns correct config for metal frame', () => {
    const config = getProductConfig('metal')
    expect(config).toEqual({
      name: 'Metal Frame',
      description: 'Sleek metal frame with modern finish',
      dimensions: '8" × 10"',
      material: 'Metal',
      finish: 'Brushed Nickel',
      basePrice: 1499,
      features: ['Tempered glass', 'Metal frame', 'Modern design'],
      image: '/products/metal-frame.jpg',
    })
  })

  it('returns correct config for rustic frame', () => {
    const config = getProductConfig('rustic')
    expect(config).toEqual({
      name: 'Rustic Frame',
      description: 'Weathered wood frame with vintage appeal',
      dimensions: '8" × 10"',
      material: 'Reclaimed Wood',
      finish: 'Distressed Brown',
      basePrice: 1399,
      features: ['Reclaimed wood', 'Vintage finish', 'Handcrafted'],
      image: '/products/rustic-frame.jpg',
    })
  })

  it('throws error for invalid product type', () => {
    expect(() => getProductConfig('invalid' as any)).toThrow()
  })
})

describe('frame-config/getCustomFrameConfig', () => {
  it('returns custom frame configuration', () => {
    const config = getCustomFrameConfig({
      width: 'custom',
      height: 'custom',
      material: 'Wood',
      finish: 'Dark Oak',
      matting: 'White',
    })
    expect(config).toEqual({
      name: 'Custom Frame',
      description: 'Custom-sized frame with your specifications',
      dimensions: 'Custom',
      material: 'Wood',
      finish: 'Dark Oak',
      basePrice: 1599,
      features: ['Custom dimensions', 'Your choice of material', 'Matting included'],
      image: '/products/custom-frame.jpg',
    })
  })

  it('handles metal material', () => {
    const config = getCustomFrameConfig({
      width: 'custom',
      height: 'custom',
      material: 'Metal',
      finish: 'Silver',
      matting: 'Black',
    })
    expect(config.material).toBe('Metal')
    expect(config.finish).toBe('Silver')
  })

  it('handles no matting', () => {
    const config = getCustomFrameConfig({
      width: 'custom',
      height: 'custom',
      material: 'Wood',
      finish: 'Natural',
      matting: 'None',
    })
    expect(config.features).toContain('No matting')
  })
})

describe('frame-config/validateFrameConfig', () => {
  it('validates correct configuration', () => {
    const config = {
      productType: 'standard',
      frameSize: 'Small',
      frameColor: 'black',
      matting: 'white',
      glassType: 'standard',
      imageUrl: 'https://example.com/image.jpg',
      imageWidth: 800,
      imageHeight: 1000,
    }
    const result = validateFrameConfig(config)
    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('rejects missing imageUrl', () => {
    const config = {
      productType: 'standard',
      frameSize: 'Small',
      frameColor: 'black',
      matting: 'white',
      glassType: 'standard',
      imageUrl: '',
      imageWidth: 800,
      imageHeight: 1000,
    }
    const result = validateFrameConfig(config)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Image URL is required')
  })

  it('rejects image too small', () => {
    const config = {
      productType: 'standard',
      frameSize: 'Small',
      frameColor: 'black',
      matting: 'white',
      glassType: 'standard',
      imageUrl: 'https://example.com/image.jpg',
      imageWidth: 300,
      imageHeight: 300,
    }
    const result = validateFrameConfig(config)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Image dimensions too small')
  })

  it('rejects invalid product type', () => {
    const config = {
      productType: 'invalid',
      frameSize: 'Small',
      frameColor: 'black',
      matting: 'white',
      glassType: 'standard',
      imageUrl: 'https://example.com/image.jpg',
      imageWidth: 800,
      imageHeight: 1000,
    }
    const result = validateFrameConfig(config)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Invalid product type')
  })

  it('rejects invalid frame size', () => {
    const config = {
      productType: 'standard',
      frameSize: 'Invalid',
      frameColor: 'black',
      matting: 'white',
      glassType: 'standard',
      imageUrl: 'https://example.com/image.jpg',
      imageWidth: 800,
      imageHeight: 1000,
    }
    const result = validateFrameConfig(config)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Invalid frame size')
  })

  it('rejects invalid frame color', () => {
    const config = {
      productType: 'standard',
      frameSize: 'Small',
      frameColor: 'Invalid',
      matting: 'white',
      glassType: 'standard',
      imageUrl: 'https://example.com/image.jpg',
      imageWidth: 800,
      imageHeight: 1000,
    }
    const result = validateFrameConfig(config)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Invalid frame color')
  })

  it('rejects invalid matting', () => {
    const config = {
      productType: 'standard',
      frameSize: 'Small',
      frameColor: 'black',
      matting: 'Invalid',
      glassType: 'standard',
      imageUrl: 'https://example.com/image.jpg',
      imageWidth: 800,
      imageHeight: 1000,
    }
    const result = validateFrameConfig(config)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Invalid matting')
  })

  it('rejects invalid glass type', () => {
    const config = {
      productType: 'standard',
      frameSize: 'Small',
      frameColor: 'black',
      matting: 'white',
      glassType: 'Invalid',
      imageUrl: 'https://example.com/image.jpg',
      imageWidth: 800,
      imageHeight: 1000,
    }
    const result = validateFrameConfig(config)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Invalid glass type')
  })
})
