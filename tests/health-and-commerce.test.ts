import { beforeEach, describe, expect, it, vi } from "vitest"
import { formatUsd, SHIPPING_RATES_CENTS } from "@/lib/commerce"

const { queryRaw } = vi.hoisted(() => ({ queryRaw: vi.fn() }))

vi.mock("@/lib/db", () => ({
  prisma: { $queryRaw: queryRaw },
}))

describe("commerce constants", () => {
  it("keeps server shipping prices in integer cents", () => {
    expect(SHIPPING_RATES_CENTS).toEqual({
      standard: 599,
      express: 1299,
      rush: 2499,
    })
    expect(formatUsd(2499)).toBe("$24.99")
  })
})

describe("GET /api/health", () => {
  beforeEach(() => {
    queryRaw.mockReset()
  })

  it("reports healthy when the database responds", async () => {
    queryRaw.mockResolvedValue([{ "?column?": 1 }])
    const { GET } = await import("@/app/api/health/route")
    const response = await GET()

    expect(response.status).toBe(200)
    expect(response.headers.get("cache-control")).toBe("no-store")
  })

  it("fails readiness when the database is unavailable", async () => {
    queryRaw.mockRejectedValue(new Error("database unavailable"))
    const { GET } = await import("@/app/api/health/route")
    const response = await GET()

    expect(response.status).toBe(503)
  })
})
