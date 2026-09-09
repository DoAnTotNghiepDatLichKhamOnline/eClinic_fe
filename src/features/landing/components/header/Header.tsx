import { useEffect, useState } from 'react'
import { Container } from '@/components/layout/Container'
import { IconLogo } from '@/components/icons'
import { Button } from '@/components/ui/Button'
import { useLanguage } from '@/context/LanguageContext'
import { cx } from '@/utils/cx'
import { headerContent, navLinks } from './header.data'
import { LanguageToggle } from './LanguageToggle'
import styles from './Header.module.css'

const utilityLinks = [
  { href: '#specialties', en: 'CHUYÊN KHOA CỦA CHÚNG TÔI', vi: 'CHUYÊN KHOA CỦA CHÚNG TÔI' },
  { href: '#doctors', en: 'TÌM BÁC SĨ', vi: 'TÌM BÁC SĨ' },
  { href: '#portal', en: 'DỊCH VỤ HỖ TRỢ BỆNH NHÂN', vi: 'DỊCH VỤ HỖ TRỢ BỆNH NHÂN' },
  { href: '#centers', en: 'CHỌN ĐỊA ĐIỂM', vi: 'CHỌN ĐỊA ĐIỂM' },
]

export function Header() {
  const { lang, t } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <div className={styles.utilityBar}>
        <Container className={styles.utilityRow}>
          <span className={styles.utilityLabel}>{lang === 'vi' ? 'Chọn dịch vụ:' : 'Choose service:'}</span>
          <div className={styles.utilityLinks}>
            {utilityLinks.map((link) => (
              <a key={link.href} href={link.href}>
                <span className={styles.utilityDot} />
                {lang === 'vi' ? link.vi : link.en}
              </a>
            ))}
          </div>
        </Container>
      </div>

      <header className={cx(styles.header, scrolled && styles.scrolled)}>
        <Container className={styles.row}>
          <a href="#top" className={styles.brand} aria-label="Meridian Health">
            <IconLogo className={styles.brandMark} />
            <span className={styles.brandName}>
              Meridian<em>Health</em>
            </span>
          </a>

          <nav
            id="primary-nav"
            className={cx(styles.nav, menuOpen && styles.navOpen)}
            aria-label="Primary"
          >
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                {t(link.label)}
              </a>
            ))}
          </nav>

          <div className={styles.actions}>
            <button type="button" className={styles.searchBtn} aria-label="Search">⌕</button>
            <LanguageToggle />

            <Button
              variant="accent"
              size="sm"
              className={styles.bookBtn}
              onClick={() => {
                window.location.hash = '#book'
              }}
            >
              {t(headerContent.bookAppointment)}
            </Button>

            <button
              type="button"
              className={styles.menuToggle}
              aria-expanded={menuOpen}
              aria-controls="primary-nav"
              aria-label="Open menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </Container>
      </header>
    </>
  )
}
