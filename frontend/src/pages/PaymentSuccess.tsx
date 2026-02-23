import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTokenStore } from '../stores/tokenStore'
import './PaymentSuccess.css'

export default function PaymentSuccess() {
  const { t } = useTranslation()
  const { tokensRemaining, refreshStatus } = useTokenStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      await refreshStatus()
      setIsLoading(false)
    }
    
    // Give webhook time to process
    const timer = setTimeout(fetchStatus, 2000)
    return () => clearTimeout(timer)
  }, [refreshStatus])

  return (
    <div className="success-page">
      <div className="container">
        <div className="success-card card">
          <div className="success-icon">✓</div>
          <h1>{t('success.title')}</h1>
          <p className="success-message">{t('success.message')}</p>
          
          {isLoading ? (
            <div className="loading-tokens">
              <div className="spinner"></div>
              <p>{t('success.loading')}</p>
            </div>
          ) : (
            <div className="tokens-info">
              <span className="tokens-label">{t('success.yourTokens')}</span>
              <span className="tokens-count">{tokensRemaining}</span>
            </div>
          )}

          <Link to="/" className="btn btn-primary">
            {t('success.startGenerating')}
          </Link>
        </div>
      </div>
    </div>
  )
}
