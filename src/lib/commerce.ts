export const SHIPPING_METHODS = ["standard", "express", "rush"] as const

export type ShippingMethod = (typeof SHIPPING_METHODS)[number]

export const SHIPPING_RATES_CENTS: Record<ShippingMethod, number> = {
  standard: 599,
  express: 1299,
  rush: 2499,
}

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export function formatUsd(cents: number): string {
  return usdFormatter.format(cents / 100)
}
