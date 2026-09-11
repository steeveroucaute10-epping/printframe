import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function formatPriceFloat(price: number): string {
  return `$${price.toFixed(2)}`
}

export function generateOrderNumber(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `PF-${dateStr}-${random}`
}

export function getShippingRate(method: string): number {
  const rates: Record<string, number> = {
    standard: 5.99,
    express: 12.99,
    rush: 24.99,
  }
  return rates[method] ?? 5.99
}

export function getImageDimensions(filename: string): { width: number; height: number } {
  // TODO(phase-2): Use sharp to read image metadata in production
  return { width: 1000, height: 1200 }
}
