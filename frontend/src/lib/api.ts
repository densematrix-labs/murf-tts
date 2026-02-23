const API_BASE = '/api/v1'

export interface Voice {
  id: string
  name: string
  gender: string
  accent: string
}

export const VOICES: Voice[] = [
  { id: 'emily', name: 'Emily', gender: 'female', accent: 'American' },
  { id: 'james', name: 'James', gender: 'male', accent: 'American' },
  { id: 'sophia', name: 'Sophia', gender: 'female', accent: 'British' },
  { id: 'oliver', name: 'Oliver', gender: 'male', accent: 'British' },
  { id: 'chloe', name: 'Chloe', gender: 'female', accent: 'Australian' },
  { id: 'xiaoxue', name: '小雪', gender: 'female', accent: 'Mandarin' },
  { id: 'yunyang', name: '云扬', gender: 'male', accent: 'Mandarin' },
  { id: 'misaki', name: '美咲', gender: 'female', accent: 'Japanese' },
  { id: 'anna', name: 'Anna', gender: 'female', accent: 'German' },
  { id: 'marie', name: 'Marie', gender: 'female', accent: 'French' },
  { id: 'jihyun', name: '지현', gender: 'female', accent: 'Korean' },
  { id: 'carmen', name: 'Carmen', gender: 'female', accent: 'Spanish' },
]

export async function generateSpeech(
  text: string,
  voice: string,
  speed: number,
  deviceId: string
): Promise<Blob> {
  const response = await fetch(`${API_BASE}/tts/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId,
    },
    body: JSON.stringify({ text, voice, speed }),
  })

  if (!response.ok) {
    const data = await response.json()
    // Handle both string and object error details
    const errorMessage = typeof data.detail === 'string'
      ? data.detail
      : data.detail?.error || data.detail?.message || 'Generation failed'
    throw new Error(errorMessage)
  }

  return response.blob()
}

export interface TokenStatus {
  device_id: string
  tokens_remaining: number
  is_premium: boolean
  daily_free_used: number
  daily_free_limit: number
}

export async function getTokenStatus(deviceId: string): Promise<TokenStatus> {
  const response = await fetch(`${API_BASE}/tokens/status`, {
    headers: {
      'X-Device-Id': deviceId,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get token status')
  }

  return response.json()
}

export async function createCheckout(
  productId: string,
  deviceId: string,
  successUrl: string
): Promise<string> {
  const response = await fetch(`${API_BASE}/payment/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: productId,
      device_id: deviceId,
      success_url: successUrl,
    }),
  })

  if (!response.ok) {
    const data = await response.json()
    const errorMessage = typeof data.detail === 'string'
      ? data.detail
      : data.detail?.error || data.detail?.message || 'Checkout failed'
    throw new Error(errorMessage)
  }

  const data = await response.json()
  return data.checkout_url
}
