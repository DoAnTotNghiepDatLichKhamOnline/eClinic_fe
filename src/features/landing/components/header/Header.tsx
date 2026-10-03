import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  ChevronDown,
  CreditCard,
  FolderOpen,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
  X,
} from 'lucide-react'
import { Container } from '@/shared/components/layout/Container'
import { IconLogo } from '@/shared/components/icons'
import { Button } from '@/shared/components/ui/Button'
import { useLanguage } from '@/shared/context/LanguageContext'
import { useAuth } from '@/shared/context/AuthContext'
import { notifyAuth } from '@/shared/utils/authNotification'
import { cx } from '@/shared/utils/cx'
import { navLinks } from './header.data'
import { LanguageToggle } from './LanguageToggle'
import styles from './Header.module.css'

export function Header() {
  const { lang, t } = useLanguage()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
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
    <header className={cx(styles.header, scrolled && styles.scrolled)}>
      <Container className={styles.row}>
        <Link to="/" className={styles.brand} aria-label="eClinic">
          <IconLogo className={styles.brandMark} />
          <span className={styles.brandName}>
            e<em>Clinic</em>
          </span>
        </Link>

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
          <button type="button" className={styles.searchBtn} aria-label="Search"><Search aria-hidden="true" size={18} /></button>
          <LanguageToggle />

          {user ? (
            <div className={styles.avatarWrapper}>
              <button type="button" className={styles.avatarBtn} aria-label="User menu">
                <span className={styles.avatarCircle}>
                  {getInitials(user.name)}
                </span>
                <ChevronDown className={styles.avatarCaret} aria-hidden="true" size={14} />
              </button>

              <div className={styles.dropdownMenu}>
                <div className={styles.dropdownHeader}>
                  <div className={styles.dropdownUserName}>{user.name}</div>
                  <span className={styles.dropdownUserRole}>{roleText(user.role)}</span>
                </div>

                <div className={styles.dropdownList}>
                  {user.role === 'doctor' && (
                    <Link to="/doctor" className={styles.dropdownItem}>
                      <span className={styles.dropdownIcon}><Stethoscope aria-hidden="true" /></span>
                      <span>{lang === 'vi' ? 'Trang Bác sĩ' : 'Doctor Portal'}</span>
                    </Link>
                  )}

                  {user.role === 'admin' && (
                    <Link to="/admin" className={styles.dropdownItem}>
                      <span className={styles.dropdownIcon}><ShieldCheck aria-hidden="true" /></span>
                      <span>{lang === 'vi' ? 'Trang Quản trị' : 'Admin Portal'}</span>
                    </Link>
                  )}

                  {user.role === 'patient' && (
                    <>
                      <a href="#appointments" className={styles.dropdownItem}>
                        <span className={styles.dropdownIcon}><CalendarDays aria-hidden="true" /></span>
                        <span>{lang === 'vi' ? 'Lịch khám' : 'Appointments'}</span>
                      </a>
                      <a href="#payment-history" className={styles.dropdownItem}>
                        <span className={styles.dropdownIcon}><CreditCard aria-hidden="true" /></span>
                        <span>{lang === 'vi' ? 'Lịch sử thanh toán' : 'Payment History'}</span>
                      </a>
                      <a href="#records" className={styles.dropdownItem}>
                        <span className={styles.dropdownIcon}><FolderOpen aria-hidden="true" /></span>
                        <span>{lang === 'vi' ? 'Hồ sơ' : 'Medical Records'}</span>
                      </a>
                      <a href="#account" className={styles.dropdownItem}>
                        <span className={styles.dropdownIcon}><UserRound aria-hidden="true" /></span>
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
                      notifyAuth(
                        'info',
                        lang === 'vi' ? 'Đã đăng xuất' : 'Signed out',
                        lang === 'vi' ? 'Bạn đã đăng xuất khỏi eClinic.' : 'You have signed out of eClinic.',
                      )
                      navigate('/')
                    }}
                  >
                    <span className={styles.dropdownIcon}><LogOut aria-hidden="true" /></span>
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
              onClick={() => navigate('/login')}
            >
              {lang === 'vi' ? 'Đăng nhập' : 'Login'}
            </Button>
          )}

          <button
            type="button"
            className={styles.menuToggle}
            aria-expanded={menuOpen}
            aria-controls="primary-nav"
            aria-label="Open menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </Container>
    </header>
  )
}
