import { IconCalendar } from '@/components/icons'
import { useLanguage } from '@/context/LanguageContext'
import type { Bilingual } from '@/types/i18n'
import styles from './EmergencyFab.module.css'

const label: Bilingual = { en: 'Book now', vi: 'Đặt lịch ngay' }

export function EmergencyFab() {
  const { t } = useLanguage()

  return (
    <a href="#book" className={styles.fab} aria-label="Book an appointment">
      <span className={styles.pulse} aria-hidden="true" />
      <IconCalendar />
      <span className={styles.label}>{t(label)}</span>
    </a>
  )
}
