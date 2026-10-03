import { Phone } from 'lucide-react'
import { useLanguage } from '@/shared/context/LanguageContext'
import { heroContent } from './hero.data'
import styles from './EmergencyHotkey.module.css'

export function EmergencyHotkey() {
  const { t } = useLanguage()

  return (
    <div className={styles.hotkey} role="complementary" aria-label="24-hour emergency hotline">
      <span className={styles.pulse} aria-hidden="true" />
      <Phone className={styles.icon} aria-hidden="true" />
      <span className={styles.text}>
        <strong>{t(heroContent.emergencyLabel)}</strong>
        <a href="tel:*9999">*9999</a>
      </span>
    </div>
  )
}
