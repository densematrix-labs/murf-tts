import { useTranslation } from 'react-i18next'
import './LanguageSwitcher.css'

const LANGUAGES = [
  { code: 'en', name: 'EN', flag: '🇺🇸' },
  { code: 'zh', name: '中', flag: '🇨🇳' },
  { code: 'ja', name: '日', flag: '🇯🇵' },
  { code: 'de', name: 'DE', flag: '🇩🇪' },
  { code: 'fr', name: 'FR', flag: '🇫🇷' },
  { code: 'ko', name: '한', flag: '🇰🇷' },
  { code: 'es', name: 'ES', flag: '🇪🇸' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value)
  }

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0]

  return (
    <div className="lang-switcher" data-testid="lang-switcher">
      <span className="lang-flag">{currentLang.flag}</span>
      <select 
        value={i18n.language} 
        onChange={handleChange}
        className="lang-select"
        aria-label="Select language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  )
}
