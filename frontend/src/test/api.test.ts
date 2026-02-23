import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateSpeech, getTokenStatus, createCheckout } from '../lib/api'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  describe('generateSpeech', () => {
    it('makes correct API call', async () => {
      const mockBlob = new Blob(['audio'], { type: 'audio/mpeg' })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      })

      const result = await generateSpeech('Hello', 'emily', 1.0, 'device-123')

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': 'device-123',
        },
        body: JSON.stringify({ text: 'Hello', voice: 'emily', speed: 1.0 }),
      })
      expect(result).toBe(mockBlob)
    })

    it('handles string error detail', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ detail: 'Something went wrong' }),
      })

      await expect(generateSpeech('Hello', 'emily', 1.0, 'device-123'))
        .rejects.toThrow('Something went wrong')
    })

    it('handles object error detail with error field', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ 
          detail: { error: 'No tokens remaining', code: 'payment_required' }
        }),
      })

      await expect(generateSpeech('Hello', 'emily', 1.0, 'device-123'))
        .rejects.toThrow('No tokens remaining')
    })

    it('handles object error detail with message field', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ 
          detail: { message: 'Invalid input' }
        }),
      })

      await expect(generateSpeech('Hello', 'emily', 1.0, 'device-123'))
        .rejects.toThrow('Invalid input')
    })

    it('does not throw [object Object]', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ 
          detail: { error: 'Test error' }
        }),
      })

      try {
        await generateSpeech('Hello', 'emily', 1.0, 'device-123')
      } catch (e) {
        const error = e as Error
        expect(error.message).not.toContain('[object Object]')
        expect(error.message).not.toContain('object Object')
      }
    })
  })

  describe('getTokenStatus', () => {
    it('makes correct API call', async () => {
      const mockStatus = {
        device_id: 'device-123',
        tokens_remaining: 5,
        is_premium: false,
        daily_free_used: 0,
        daily_free_limit: 5,
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStatus),
      })

      const result = await getTokenStatus('device-123')

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/tokens/status', {
        headers: {
          'X-Device-Id': 'device-123',
        },
      })
      expect(result).toEqual(mockStatus)
    })

    it('throws on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      })

      await expect(getTokenStatus('device-123'))
        .rejects.toThrow('Failed to get token status')
    })
  })

  describe('createCheckout', () => {
    it('makes correct API call', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ checkout_url: 'https://checkout.example.com' }),
      })

      const result = await createCheckout('starter', 'device-123', 'https://example.com/success')

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: 'starter',
          device_id: 'device-123',
          success_url: 'https://example.com/success',
        }),
      })
      expect(result).toBe('https://checkout.example.com')
    })

    it('handles checkout error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ detail: 'Product not found' }),
      })

      await expect(createCheckout('invalid', 'device-123', 'https://example.com/success'))
        .rejects.toThrow('Product not found')
    })
  })
})
