import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock console.log to capture email logs
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})

// Mock next/config
vi.mock('next/config', () => ({
  default: () => ({
    publicRuntimeConfig: {
      SMTP_HOST: 'smtp.test.com',
      SMTP_PORT: '587',
      SMTP_USER: 'test@test.com',
      SMTP_PASS: 'test-pass',
    },
  }),
}))

const { sendEmail, sendOrderConfirmation, sendOrderStatusUpdate } = await import('@/lib/email')

describe('email/service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('sendEmail', () => {
    it('logs email with correct parameters', async () => {
      await sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      })

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '📧 Sending email:',
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'Test Subject',
        })
      )
    })

    it('sends to multiple recipients', async () => {
      await sendEmail({
        to: ['test1@example.com', 'test2@example.com'],
        subject: 'Multi Recipient',
        html: '<p>Test</p>',
      })

      expect(mockConsoleLog).toHaveBeenCalled()
    })
  })

  describe('sendOrderConfirmation', () => {
    it('sends order confirmation email', async () => {
      await sendOrderConfirmation('customer@example.com', 'PF-20260910-0001', 99.99)
      
      expect(mockConsoleLog).toHaveBeenCalled()
      const callArgs = mockConsoleLog.mock.calls[0][1]
      expect(callArgs.to).toBe('customer@example.com')
      expect(callArgs.subject).toContain('Order Confirmation')
      expect(callArgs.subject).toContain('PF-20260910-0001')
    })
  })

  describe('sendOrderStatusUpdate', () => {
    it('sends processing status update', async () => {
      await sendOrderStatusUpdate('customer@example.com', 'PF-20260910-0001', 'processing')
      
      expect(mockConsoleLog).toHaveBeenCalled()
    })

    it('sends shipping status with tracking', async () => {
      await sendOrderStatusUpdate('customer@example.com', 'PF-20260910-0001', 'shipped', 'TRACK123')
      
      expect(mockConsoleLog).toHaveBeenCalled()
    })

    it('sends delivered confirmation', async () => {
      await sendOrderStatusUpdate('customer@example.com', 'PF-20260910-0001', 'delivered')
      
      expect(mockConsoleLog).toHaveBeenCalled()
    })
  })
})
