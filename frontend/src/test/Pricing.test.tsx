import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Pricing from '../pages/Pricing'
import * as api from '../lib/api'

// Mock the token store
vi.mock('../stores/tokenStore', () => ({
  useTokenStore: () => ({
    deviceId: 'test-device-id',
  }),
}))

// Mock the API
vi.mock('../lib/api', () => ({
  createCheckout: vi.fn(),
}))

// Mock window.location
const mockLocation = {
  href: '',
  origin: 'http://localhost:3000',
}
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

const renderPricing = () => {
  return render(
    <BrowserRouter>
      <Pricing />
    </BrowserRouter>
  )
}

describe('Pricing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocation.href = ''
  })

  it('renders pricing header', () => {
    renderPricing()
    expect(screen.getByText('pricing.title')).toBeInTheDocument()
    expect(screen.getByText('pricing.subtitle')).toBeInTheDocument()
  })

  it('renders all pricing tiers', () => {
    renderPricing()
    expect(screen.getByText('pricing.tiers.starter')).toBeInTheDocument()
    expect(screen.getByText('pricing.tiers.pro')).toBeInTheDocument()
    expect(screen.getByText('pricing.tiers.unlimited')).toBeInTheDocument()
  })

  it('renders buy buttons for each tier', () => {
    renderPricing()
    const buyButtons = screen.getAllByText('pricing.buyNow')
    expect(buyButtons).toHaveLength(3)
  })

  it('highlights popular tier', () => {
    renderPricing()
    expect(screen.getByText('pricing.popular')).toBeInTheDocument()
  })

  it('handles checkout creation', async () => {
    vi.mocked(api.createCheckout).mockResolvedValueOnce('https://checkout.example.com')

    renderPricing()
    const buyButtons = screen.getAllByText('pricing.buyNow')
    
    fireEvent.click(buyButtons[0]) // Click starter tier

    await waitFor(() => {
      expect(api.createCheckout).toHaveBeenCalledWith(
        'starter',
        'test-device-id',
        'http://localhost:3000/payment/success'
      )
    })

    expect(mockLocation.href).toBe('https://checkout.example.com')
  })

  it('handles checkout error', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    vi.mocked(api.createCheckout).mockRejectedValueOnce(new Error('Checkout failed'))

    renderPricing()
    const buyButtons = screen.getAllByText('pricing.buyNow')
    
    fireEvent.click(buyButtons[0])

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('error.checkoutFailed')
    })

    alertSpy.mockRestore()
  })

  it('renders FAQ section', () => {
    renderPricing()
    expect(screen.getByText('pricing.faqTitle')).toBeInTheDocument()
    expect(screen.getByText('pricing.faq.q1')).toBeInTheDocument()
    expect(screen.getByText('pricing.faq.a1')).toBeInTheDocument()
  })
})
