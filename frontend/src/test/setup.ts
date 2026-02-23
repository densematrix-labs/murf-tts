import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (options?.count !== undefined) {
        return `${key} (${options.count})`
      }
      return key
    },
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
}))

// Mock FingerprintJS
vi.mock('@fingerprintjs/fingerprintjs', () => ({
  default: {
    load: vi.fn(() => Promise.resolve({
      get: vi.fn(() => Promise.resolve({ visitorId: 'test-device-id' })),
    })),
  },
}))
