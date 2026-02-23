import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LanguageSwitcher from '../components/LanguageSwitcher'

// Create a mock changeLanguage function
const mockChangeLanguage = vi.fn()

// Override the default mock for this test file
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: mockChangeLanguage,
    },
  }),
}))

describe('LanguageSwitcher', () => {
  it('renders language switcher', () => {
    render(<LanguageSwitcher />)
    const switcher = screen.getByTestId('lang-switcher')
    expect(switcher).toBeInTheDocument()
  })

  it('renders select with options', () => {
    render(<LanguageSwitcher />)
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
  })

  it('contains all language options', () => {
    render(<LanguageSwitcher />)
    const options = screen.getAllByRole('option')
    expect(options.length).toBe(7) // en, zh, ja, de, fr, ko, es
  })

  it('changes language when selection changes', () => {
    render(<LanguageSwitcher />)
    const select = screen.getByRole('combobox')
    
    fireEvent.change(select, { target: { value: 'zh' } })
    
    expect(mockChangeLanguage).toHaveBeenCalledWith('zh')
  })

  it('shows current flag emoji', () => {
    render(<LanguageSwitcher />)
    // Should show US flag for English
    expect(screen.getByText('🇺🇸')).toBeInTheDocument()
  })
})
