import { useNavigate } from 'react-router-dom'
import { Container } from '@/shared/components/layout/Container'
import { Button, ButtonLink } from '@/shared/components/ui/Button'
import { useLanguage } from '@/shared/context/LanguageContext'
import { ctaContent } from './cta.data'
import styles from './CtaSection.module.css'

export function CtaSection() {
  const { t } = useLanguage()
  const navigate = useNavigate()

  return (
    <section className={styles.section} id="book">
      <Container className={styles.row}>
        <div>
          <h2>{t(ctaContent.title)}</h2>
          <p>{t(ctaContent.description)}</p>
        </div>
        <div className={styles.actions}>
          <Button
            variant="accent"
            size="lg"
            onClick={() => navigate('/appointment')}
          >
            {t(ctaContent.primaryCta)}
          </Button>
          <ButtonLink href="tel:*9999" variant="ghostDark" size="lg">
            {t(ctaContent.secondaryCta)}
          </ButtonLink>
        </div>
      </Container>
    </section>
  )
}
