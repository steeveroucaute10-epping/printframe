import { describe, it, expect } from 'vitest'
import {
  formatPrice,
  formatPriceFloat,
  generateOrderNumber,
  getShippingRate,
  getImageDimensions,
} from '@/lib/utils'

describe('utils/formatPrice', () => {
  it('converts cents to dollar format', () => {
    expect(formatPrice(100)).toBe('$1.00')
    expect(formatPrice(1599)).toBe('$15.99')
    expect(formatPrice(0)).toBe('$0.00')
  })

  it('handles zero and edge cases', () => {
    expect(formatPrice(50)).toBe('$0.50')
    expect(formatPrice(10000)).toBe('$100.00')
  })
})

describe('utils/formatPriceFloat', () => {
  it('formats decimal prices', () => {
    expect(formatPriceFloat(1.5)).toBe('$1.50')
    expect(formatPriceFloat(0)).toBe('$0.00')
    expect(formatPriceFloat(15.99)).toBe('$15.99')
  })

  it('handles whole numbers', () => {
    expect(formatPriceFloat(100)).toBe('$100.00')
    expect(formatPriceFloat(0)).toBe('$0.00')
  })
})

describe('utils/generateOrderNumber', () => {
  it('generates order number with PF prefix and date', () => {
    const orderNumber = generateOrderNumber()
    expect(orderNumber).toMatch(/^PF-\d{8}-\d{4}$/)
  })

  it('date portion matches today\'s date', () => {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const orderNumber = generateOrderNumber()
    expect(orderNumber).toContain(`PF-${dateStr}-`)
  })

  it('generates unique order numbers', () => {
    const orders = new Set()
    for (let i = 0; i < 100; i++) {
      orders.add(generateOrderNumber())
    }
    expect(orders.size).toBe(100)
  })
})

describe('utils/getShippingRate', () => {
  it('returns standard rate for standard method', () => {
    expect(getShippingRate('standard')).toBe(5.99)
  })

  it('returns express rate for express method', () => {
    expect(getShippingRate('express')).toBe(12.99)
  })

  it('returns rush rate for rush method', () => {
    expect(getShippingRate('rush')).toBe(24.99)
  })

  it('returns default rate for unknown method', () => {
    expect(getShippingRate('unknown')).toBe(5.99)
    expect(getShippingRate('')).toBe(5.99)
  })
})

describe('utils/getImageDimensions', () => {
  it('returns default dimensions', () => {
    const dims = getImageDimensions('test.jpg')
    expect(dims).toEqual({ width: 1000, height: 1200 })
  })

  it('works with different filenames', () => {
    expect(getImageDimensions('photo.png')).toEqual({ width: 1000, height: 1200 })
    expect(getImageDimensions('image.webp')).toEqual({ width: 1000, height: 1200 })
  })
})
