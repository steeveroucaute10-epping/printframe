import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mockFindUnique = vi.fn()
const mockCreate = vi.fn()
const mockHash = vi.fn().mockResolvedValue('hashed-password')

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: mockFindUnique,
      create: mockCreate,
    },
  },
}))

vi.mock('bcryptjs', () => ({
  default: { hash: mockHash },
}))

const { POST } = await import('@/app/api/auth/register/route')

describe('API: Registration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFindUnique.mockResolvedValue(null)
    mockCreate.mockResolvedValue({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'CUSTOMER',
    })
  })

  it('normalizes email before lookup and storage', async () => {
    const response = await POST(new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: '  TEST@Example.com ',
        password: 'correct horse battery staple',
      }),
    }))

    expect(response.status).toBe(201)
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } })
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ email: 'test@example.com' }),
    })
  })

  it('rejects oversized passwords before hashing', async () => {
    const response = await POST(new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'x'.repeat(129),
      }),
    }))

    expect(response.status).toBe(400)
    expect(mockHash).not.toHaveBeenCalled()
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('performs password hashing before returning the generic existing-account response', async () => {
    mockFindUnique.mockResolvedValue({ id: 'existing-user' })

    const response = await POST(new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'correct horse battery staple',
      }),
    }))

    expect(response.status).toBe(201)
    expect(mockHash).toHaveBeenCalledWith('correct horse battery staple', 12)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('rejects chunked bodies that exceed the route limit', async () => {
    const response = await POST(new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'x'.repeat(10_001),
        email: 'test@example.com',
        password: 'correct horse battery staple',
      }),
    }))

    expect(response.status).toBe(413)
    expect(mockHash).not.toHaveBeenCalled()
  })
})
