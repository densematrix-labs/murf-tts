import { create } from 'zustand'
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { getTokenStatus } from '../lib/api'

interface TokenState {
  deviceId: string
  tokensRemaining: number
  isPremium: boolean
  isInitialized: boolean
  initDevice: () => Promise<void>
  refreshStatus: () => Promise<void>
}

export const useTokenStore = create<TokenState>((set, get) => ({
  deviceId: '',
  tokensRemaining: 5,
  isPremium: false,
  isInitialized: false,

  initDevice: async () => {
    if (get().isInitialized) return

    try {
      const fp = await FingerprintJS.load()
      const result = await fp.get()
      const deviceId = result.visitorId

      set({ deviceId, isInitialized: true })

      // Fetch initial token status
      const status = await getTokenStatus(deviceId)
      set({
        tokensRemaining: status.tokens_remaining,
        isPremium: status.is_premium,
      })
    } catch (error) {
      // Fallback to random ID
      const fallbackId = 'fallback-' + Math.random().toString(36).substring(7)
      set({ deviceId: fallbackId, isInitialized: true })
    }
  },

  refreshStatus: async () => {
    const { deviceId } = get()
    if (!deviceId) return

    try {
      const status = await getTokenStatus(deviceId)
      set({
        tokensRemaining: status.tokens_remaining,
        isPremium: status.is_premium,
      })
    } catch (error) {
      console.error('Failed to refresh token status:', error)
    }
  },
}))
