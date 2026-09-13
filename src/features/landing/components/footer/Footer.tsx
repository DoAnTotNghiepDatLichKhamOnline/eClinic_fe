import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/Button'
import { IconLogo } from '@/components/icons'
import { useActiveHub } from '@/context/ActiveHubContext'
import { useLanguage } from '@/context/LanguageContext'
import { hubs } from '@/features/landing/components/centers/centers.data'
import { footerContent } from './footer.data'
import styles from './Footer.module.css'

export function Footer() {
  const { t } = useLanguage()
  const { setActiveHub } = useActiveHub()

  return (
    <footer className={styles.footer}>
      <Container className={styles.grid}>
        <div className={styles.bookCol}>
          <div className={styles.brand}>
            <IconLogo />
            <span>
              e<em>Clinic</em>
            </span>
          </div>
          <h3>{t(footerContent.bookTitle)}</h3>
          <p>{t(footerContent.bookBody)}</p>
          <ButtonLink href="#book" variant="accent" size="sm">
            {t(footerContent.bookOnline)}
          </ButtonLink>
          <p className={styles.hotline}>
            {t(footerContent.callOr)} <a href="tel:*9999">*9999</a>
          </p>
        </div>

        <div className={styles.col}>
          <h4>{t(footerContent.portalTitle)}</h4>
          <ul>
            {footerContent.portalLinks.map((link) => (
              <li key={t(link)}>
                <a href="#">{t(link)}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <h4>{t(footerContent.centersTitle)}</h4>
          <ul>
            {hubs.map((hub) => (
              <li key={hub.id}>
                <a
                  href="#centers"
                  onClick={(e) => {
                    e.preventDefault()
                    setActiveHub(hub.id)
                    document.getElementById('centers')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  {hub.cityName} — {hub.phone}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <h4>{t(footerContent.legalTitle)}</h4>
          <ul>
            <li>{t(footerContent.license)}</li>
            <li>
              <a href="#">{t(footerContent.privacy)}</a>
            </li>
            <li>
              <a href="#">{t(footerContent.terms)}</a>
            </li>
          </ul>
        </div>
      </Container>

      <Container className={styles.bottom}>
        <span>© 2026 eClinic Group.</span>
        <span>{t(footerContent.rights)}</span>
      </Container>
    </footer>
  )
}
