import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { t } = useTranslation()
  const location = useLocation()

  return (
    <div className="layout">
      <header className="header">
        <div className="container header-content">
          <Link to="/" className="logo">
            <span className="logo-icon">◉</span>
            <span className="logo-text">MURF<span className="logo-accent">TTS</span></span>
          </Link>

          <nav className="nav">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              {t('nav.home')}
            </Link>
            <Link 
              to="/pricing" 
              className={`nav-link ${location.pathname === '/pricing' ? 'active' : ''}`}
            >
              {t('nav.pricing')}
            </Link>
          </nav>

          <div className="header-actions">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="main">
        {children}
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <span className="logo-icon">◉</span> MURF TTS
          </div>
          <div className="footer-links">
            <span>© 2026 DenseMatrix Labs</span>
            <span className="separator">|</span>
            <span>{t('footer.tagline')}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
