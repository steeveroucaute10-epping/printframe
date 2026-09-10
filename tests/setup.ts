import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

// Suppress React warnings during tests
const originalError = console.error
console.error = (...args) => {
  if (/Warning.*not wrapped in act/.test(args[0])) return
  originalError(...args)
}

// Store original for restoration in tests if needed
(global as any).__restoreConsole = () => {
  console.error = originalError
}
