import { useLanguage } from '@/context/LanguageContext'
import { cx } from '@/utils/cx'
import styles from './LanguageToggle.module.css'

export function LanguageToggle() {
  const { lang, toggleLanguage } = useLanguage()

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleLanguage}
      aria-pressed={lang === 'vi'}
      aria-label="Switch language"
    >
      <span className={cx(styles.opt, lang === 'en' && styles.isActive)}>EN</span>
      <span className={styles.divider}>/</span>
      <span className={cx(styles.opt, lang === 'vi' && styles.isActive)}>VI</span>
    </button>
  )
}
