import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/Button'
import { useLanguage } from '@/context/LanguageContext'
import { ctaContent } from './cta.data'
import styles from './CtaSection.module.css'

export function CtaSection() {
  const { t } = useLanguage()

  return (
    <section className={styles.section} id="book">
      <Container className={styles.row}>
        <div>
          <h2>{t(ctaContent.title)}</h2>
          <p>{t(ctaContent.description)}</p>
        </div>
        <div className={styles.actions}>
          <ButtonLink href="#" variant="accent" size="lg">
            {t(ctaContent.primaryCta)}
          </ButtonLink>
          <ButtonLink href="tel:*9999" variant="ghostDark" size="lg">
            {t(ctaContent.secondaryCta)}
          </ButtonLink>
        </div>
      </Container>
    </section>
  )
}
