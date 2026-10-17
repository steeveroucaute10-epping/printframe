import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/auth', () => ({
  getRequestUser: vi.fn().mockResolvedValue({
    id: 'customer-1',
    role: 'CUSTOMER',
  }),
  isAdmin: () => false,
}))

const { POST } = await import('@/app/api/ai/enhance/route')

describe('API: AI enhancement security', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    delete process.env.OLLAMA_BASE_URL
  })

  it('rejects non-URL image input before contacting Ollama', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const response = await POST(new NextRequest('http://localhost/api/ai/enhance', {
      method: 'POST',
      body: JSON.stringify({ imageUrl: 'not-a-url' }),
    }))

    expect(response.status).toBe(400)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('does not contact an Ollama host outside the fixed local allowlist', async () => {
    process.env.OLLAMA_BASE_URL = 'http://169.254.169.254/latest/meta-data'
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const response = await POST(new NextRequest('http://localhost/api/ai/enhance', {
      method: 'POST',
      body: JSON.stringify({ imageUrl: 'https://example.com/photo.jpg' }),
    }))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.mockProcessing).toBe(true)
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
