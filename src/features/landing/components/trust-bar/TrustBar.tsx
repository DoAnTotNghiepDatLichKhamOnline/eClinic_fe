import { Container } from '@/components/layout/Container'
import { useLanguage } from '@/context/LanguageContext'
import { trustMetrics } from './trust-bar.data'
import styles from './TrustBar.module.css'

export function TrustBar() {
  const { t } = useLanguage()

  return (
    <section className={styles.section} aria-label="Why patients choose eClinic">
      <Container className={styles.row}>
        {trustMetrics.map((metric) => (
          <div className={styles.item} key={metric.value + t(metric.label)}>
            <span className={styles.value}>{metric.value}</span>
            <span className={styles.label}>{t(metric.label)}</span>
          </div>
        ))}
      </Container>
    </section>
  )
}
