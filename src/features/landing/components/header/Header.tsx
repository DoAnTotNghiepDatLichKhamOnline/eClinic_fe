import { useEffect, useState } from 'react'
import { Container } from '@/components/layout/Container'
import { IconLogo } from '@/components/icons'
import { Button } from '@/components/ui/Button'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { cx } from '@/utils/cx'
import { headerContent, navLinks } from './header.data'
import { LanguageToggle } from './LanguageToggle'
import styles from './Header.module.css'

const utilityLinks = [
  { href: '#specialties', en: 'CHUYÊN KHOA CỦA CHÚNG TÔI', vi: 'CHUYÊN KHOA CỦA CHÚNG TÔI' },
  { href: '#doctors', en: 'TÌM BÁC SĨ', vi: 'TÌM BÁC SĨ' },
  { href: '#book', en: 'ĐẶT LỊCH KHÁM', vi: 'ĐẶT LỊCH KHÁM' },
  { href: '#centers', en: 'CHỌN ĐỊA ĐIỂM', vi: 'CHỌN ĐỊA ĐIỂM' },
]

export function Header() {
  const { lang, t } = useLanguage()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Helper to extract initials from user name
  const getInitials = (name: string) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const roleText = (role?: string) => {
    if (role === 'doctor') return lang === 'vi' ? 'Bác sĩ' : 'Doctor'
    if (role === 'admin') return lang === 'vi' ? 'Quản trị viên' : 'Admin'
    return lang === 'vi' ? 'Bệnh nhân' : 'Patient'
  }

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
          <a href="#top" className={styles.brand} aria-label="eClinic">
            <IconLogo className={styles.brandMark} />
            <span className={styles.brandName}>
              e<em>Clinic</em>
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

            {user ? (
              <div className={styles.avatarWrapper}>
                <button type="button" className={styles.avatarBtn} aria-label="User menu">
                  <span className={styles.avatarCircle}>
                    {getInitials(user.name)}
                  </span>
                  <span className={styles.avatarCaret}>▼</span>
                </button>

                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownUserName}>{user.name}</div>
                    <span className={styles.dropdownUserRole}>{roleText(user.role)}</span>
                  </div>

                  <div className={styles.dropdownList}>
                    {user.role === 'doctor' && (
                      <a href="#doctor" className={styles.dropdownItem}>
                        <span className={styles.dropdownIcon}>🩺</span>
                        <span>{lang === 'vi' ? 'Trang Bác sĩ' : 'Doctor Portal'}</span>
                      </a>
                    )}

                    {user.role === 'admin' && (
                      <a href="#admin" className={styles.dropdownItem}>
                        <span className={styles.dropdownIcon}>🛡️</span>
                        <span>{lang === 'vi' ? 'Trang Quản trị' : 'Admin Portal'}</span>
                      </a>
                    )}

                    {user.role === 'patient' && (
                      <>
                        <a href="#appointments" className={styles.dropdownItem}>
                          <span className={styles.dropdownIcon}>📅</span>
                          <span>{lang === 'vi' ? 'Lịch khám' : 'Appointments'}</span>
                        </a>
                        <a href="#payment-history" className={styles.dropdownItem}>
                          <span className={styles.dropdownIcon}>💳</span>
                          <span>{lang === 'vi' ? 'Lịch sử thanh toán' : 'Payment History'}</span>
                        </a>
                        <a href="#records" className={styles.dropdownItem}>
                          <span className={styles.dropdownIcon}>📁</span>
                          <span>{lang === 'vi' ? 'Hồ sơ' : 'Medical Records'}</span>
                        </a>
                        <a href="#account" className={styles.dropdownItem}>
                          <span className={styles.dropdownIcon}>👤</span>
                          <span>{lang === 'vi' ? 'Tài khoản' : 'Account'}</span>
                        </a>
                      </>
                    )}

                    <div className={styles.dropdownDivider} />

                    <button
                      type="button"
                      className={cx(styles.dropdownItem, styles.logoutItem)}
                      onClick={() => {
                        logout()
                        window.location.hash = ''
                      }}
                    >
                      <span className={styles.dropdownIcon}>🚪</span>
                      <span>{lang === 'vi' ? 'Đăng xuất' : 'Log Out'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                variant="ghostDark"
                size="sm"
                className={styles.loginBtn}
                onClick={() => {
                  window.location.hash = '#login'
                }}
              >
                {lang === 'vi' ? 'Đăng nhập' : 'Login'}
              </Button>
            )}

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
