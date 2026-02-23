import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { generateSpeech, Voice, VOICES } from '../lib/api'
import { useTokenStore } from '../stores/tokenStore'
import './Home.css'

export default function Home() {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [voice, setVoice] = useState('emily')
  const [speed, setSpeed] = useState(1.0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { tokensRemaining, deviceId, refreshStatus } = useTokenStore()

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError(t('error.emptyText'))
      return
    }

    if (text.length > 5000) {
      setError(t('error.textTooLong'))
      return
    }

    setIsLoading(true)
    setError(null)
    setAudioUrl(null)

    try {
      const audioBlob = await generateSpeech(text, voice, speed, deviceId)
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)
      await refreshStatus()
      
      setTimeout(() => {
        audioRef.current?.play()
      }, 100)
    } catch (err) {
      const message = err instanceof Error ? err.message : t('error.unknown')
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement('a')
      a.href = audioUrl
      a.download = 'murf-tts-audio.mp3'
      a.click()
    }
  }

  return (
    <div className="home">
      <div className="container">
        {/* Hero */}
        <section className="hero">
          <div className="hero-badge">{t('hero.badge')}</div>
          <h1 className="hero-title">
            {t('hero.title')}
            <span className="title-accent"> {t('hero.titleAccent')}</span>
          </h1>
          <p className="hero-subtitle">{t('hero.subtitle')}</p>
          <div className="hero-tags">
            <span className="tag">✓ {t('hero.tag1')}</span>
            <span className="tag">✓ {t('hero.tag2')}</span>
            <span className="tag">✓ {t('hero.tag3')}</span>
          </div>
        </section>

        {/* Generator */}
        <section className="generator card">
          <div className="generator-header">
            <h2>{t('generator.title')}</h2>
            <div className="token-display">
              <span className="token-icon">◉</span>
              {tokensRemaining > 0 ? (
                <span>{t('generator.tokensLeft', { count: tokensRemaining })}</span>
              ) : (
                <Link to="/pricing" className="token-link">{t('generator.getMore')}</Link>
              )}
            </div>
          </div>

          <div className="generator-body">
            {/* Text input */}
            <div className="input-group">
              <label>{t('generator.textLabel')}</label>
              <textarea
                data-testid="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('generator.placeholder')}
                maxLength={5000}
              />
              <div className="input-meta">
                <span className="char-count">{text.length}/5000</span>
              </div>
            </div>

            {/* Controls */}
            <div className="controls-grid">
              <div className="input-group">
                <label>{t('generator.voiceLabel')}</label>
                <select
                  data-testid="voice-select"
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                >
                  {VOICES.map((v: Voice) => (
                    <option key={v.id} value={v.id}>
                      {v.name} • {v.accent}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>{t('generator.speedLabel')}: {speed.toFixed(1)}x</label>
                <div className="speed-control">
                  <span className="speed-label">0.5x</span>
                  <input
                    data-testid="speed-slider"
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="speed-slider"
                  />
                  <span className="speed-label">2x</span>
                </div>
              </div>
            </div>

            {/* Generate button */}
            <button
              className="btn btn-primary generate-btn"
              onClick={handleGenerate}
              disabled={isLoading || !text.trim() || tokensRemaining <= 0}
              data-testid="generate-btn"
            >
              {isLoading ? (
                <span className="loading-indicator">
                  <span className="bar"></span>
                  <span className="bar"></span>
                  <span className="bar"></span>
                  <span className="bar"></span>
                  {t('generator.generating')}
                </span>
              ) : (
                <>▶ {t('generator.generate')}</>
              )}
            </button>

            {/* Error */}
            {error && (
              <div className="error-message" data-testid="error-message">
                ⚠ {error}
              </div>
            )}

            {/* Audio result */}
            {audioUrl && (
              <div className="audio-result" data-testid="audio-result">
                <div className="audio-visualizer">
                  <span className="viz-bar"></span>
                  <span className="viz-bar"></span>
                  <span className="viz-bar"></span>
                  <span className="viz-bar"></span>
                  <span className="viz-bar"></span>
                </div>
                <audio ref={audioRef} controls src={audioUrl} className="audio-player" />
                <button className="btn btn-secondary" onClick={handleDownload}>
                  ↓ {t('generator.download')}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="features">
          <h2>{t('features.title')}</h2>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <h3>{t('features.fast.title')}</h3>
              <p>{t('features.fast.desc')}</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎭</span>
              <h3>{t('features.voices.title')}</h3>
              <p>{t('features.voices.desc')}</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🌍</span>
              <h3>{t('features.multilingual.title')}</h3>
              <p>{t('features.multilingual.desc')}</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💰</span>
              <h3>{t('features.free.title')}</h3>
              <p>{t('features.free.desc')}</p>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="comparison">
          <h2>{t('comparison.title')}</h2>
          <div className="comparison-table card">
            <table>
              <thead>
                <tr>
                  <th>{t('comparison.feature')}</th>
                  <th className="highlight-col">Murf TTS</th>
                  <th>Murf.ai</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{t('comparison.freeUsage')}</td>
                  <td className="highlight-col">✓ 5/day</td>
                  <td>10 min trial</td>
                </tr>
                <tr>
                  <td>{t('comparison.noSignup')}</td>
                  <td className="highlight-col">✓</td>
                  <td>✗</td>
                </tr>
                <tr>
                  <td>{t('comparison.voices')}</td>
                  <td className="highlight-col">12+</td>
                  <td>120+</td>
                </tr>
                <tr>
                  <td>{t('comparison.price')}</td>
                  <td className="highlight-col">$4.99</td>
                  <td>$19-$99/mo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
