import { describe, expect, it, vi } from 'vitest'
import { getNextAuthSecret } from '@/lib/env'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextConfig = require('../next.config.js')

describe('security configuration', () => {
  it('applies browser security headers to every route', async () => {
    const rules = await nextConfig.headers()
    const headers = new Map(
      rules[0].headers.map((header: { key: string; value: string }) => [
        header.key,
        header.value,
      ]),
    )

    expect(rules[0].source).toBe('/(.*)')
    expect(headers.get('Content-Security-Policy')).toContain("object-src 'none'")
    expect(headers.get('Content-Security-Policy')).toContain("frame-ancestors 'none'")
    expect(headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(headers.get('X-Frame-Options')).toBe('DENY')
  })

  it('fails closed when the production auth secret is missing or weak', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXTAUTH_SECRET', 'too-short')

    expect(() => getNextAuthSecret()).toThrow(/at least 32 characters/)

    vi.unstubAllEnvs()
  })
})
