import { useLanguage } from '@/context/LanguageContext'
import { centersContent } from './centers.data'
import styles from './EmergencyBanner.module.css'

export function EmergencyBanner() {
  const { t } = useLanguage()

  return (
    <div className={styles.banner}>
      <span className={styles.badge}>{t(centersContent.emergencyBadge)}</span>
      <a href="tel:*9999">*9999</a>
      <span className={styles.note}>{t(centersContent.emergencyNote)}</span>
    </div>
  )
}
