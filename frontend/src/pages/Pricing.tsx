import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createCheckout } from '../lib/api'
import { useTokenStore } from '../stores/tokenStore'
import './Pricing.css'

interface PricingTier {
  id: string
  price: string
  priceValue: number
  credits: string
  features: string[]
  popular?: boolean
}

export default function Pricing() {
  const { t } = useTranslation()
  const { deviceId } = useTokenStore()
  const [loadingTier, setLoadingTier] = useState<string | null>(null)

  const tiers: PricingTier[] = [
    {
      id: 'starter',
      price: '$4.99',
      priceValue: 4.99,
      credits: '50',
      features: [
        t('pricing.features.generations', { count: 50 }),
        t('pricing.features.allVoices'),
        t('pricing.features.mp3Download'),
        t('pricing.features.noExpiry'),
      ],
    },
    {
      id: 'pro',
      price: '$9.99',
      priceValue: 9.99,
      credits: '150',
      popular: true,
      features: [
        t('pricing.features.generations', { count: 150 }),
        t('pricing.features.allVoices'),
        t('pricing.features.mp3Download'),
        t('pricing.features.noExpiry'),
        t('pricing.features.prioritySupport'),
      ],
    },
    {
      id: 'unlimited',
      price: '$9.99/mo',
      priceValue: 9.99,
      credits: '∞',
      features: [
        t('pricing.features.unlimited'),
        t('pricing.features.allVoices'),
        t('pricing.features.mp3Download'),
        t('pricing.features.prioritySupport'),
        t('pricing.features.cancelAnytime'),
      ],
    },
  ]

  const handlePurchase = async (tierId: string) => {
    setLoadingTier(tierId)
    try {
      const successUrl = `${window.location.origin}/payment/success`
      const checkoutUrl = await createCheckout(tierId, deviceId, successUrl)
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Failed to create checkout:', error)
      alert(t('error.checkoutFailed'))
    } finally {
      setLoadingTier(null)
    }
  }

  return (
    <div className="pricing-page">
      <div className="container">
        <section className="pricing-header">
          <h1>{t('pricing.title')}</h1>
          <p className="pricing-subtitle">{t('pricing.subtitle')}</p>
        </section>

        <section className="pricing-grid">
          {tiers.map((tier) => (
            <div 
              key={tier.id} 
              className={`pricing-card ${tier.popular ? 'popular' : ''}`}
            >
              {tier.popular && (
                <div className="popular-badge">{t('pricing.popular')}</div>
              )}
              
              <div className="tier-header">
                <h3>{t(`pricing.tiers.${tier.id}`)}</h3>
                <div className="tier-price">
                  <span className="price">{tier.price}</span>
                </div>
                <div className="tier-credits">
                  <span className="credits-value">{tier.credits}</span>
                  <span className="credits-label">{t('pricing.generations')}</span>
                </div>
              </div>

              <ul className="tier-features">
                {tier.features.map((feature, idx) => (
                  <li key={idx}>
                    <span className="check">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`btn ${tier.popular ? 'btn-primary' : 'btn-secondary'} buy-btn`}
                onClick={() => handlePurchase(tier.id)}
                disabled={loadingTier === tier.id}
              >
                {loadingTier === tier.id ? t('pricing.processing') : t('pricing.buyNow')}
              </button>
            </div>
          ))}
        </section>

        <section className="pricing-faq">
          <h2>{t('pricing.faqTitle')}</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>{t('pricing.faq.q1')}</h4>
              <p>{t('pricing.faq.a1')}</p>
            </div>
            <div className="faq-item">
              <h4>{t('pricing.faq.q2')}</h4>
              <p>{t('pricing.faq.a2')}</p>
            </div>
            <div className="faq-item">
              <h4>{t('pricing.faq.q3')}</h4>
              <p>{t('pricing.faq.a3')}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
