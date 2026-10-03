import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Header } from '@/features/landing/components/header/Header'
import { Footer } from '@/features/landing/components/footer/Footer'
import { useLanguage } from '@/shared/context/LanguageContext'
import { useAuth } from '@/shared/context/AuthContext'
import { cx } from '@/shared/utils/cx'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import styles from './LoginPagePatient.module.css'

export function LoginPagePatient() {
  const { lang } = useLanguage()
  const { login } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeAction = searchParams.get('action') === 'register' ? 'register' : 'login'

  // Form states
  const [loginPhone, setLoginPhone] = useState('')

  const [message, setMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null)

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault()
    login({
      id: 'pat-' + Date.now(),
      name: 'Nguyễn Văn A',
      phone: loginPhone || '0912345678',
      role: 'patient',
    })
    setMessage({
      type: 'success',
      text: lang === 'vi' 
        ? 'Đăng nhập thành công! Đang chuyển về Trang chủ...' 
        : 'Login successful! Redirecting to Home...',
    })
    setTimeout(() => {
      window.location.hash = ''
    }, 600)
  }

  const handleRegisterSubmit = (phone: string, password: string, confirmPassword: string) => {
    if (password !== confirmPassword) {
      setMessage({
        type: 'error',
        text: lang === 'vi' ? 'Mật khẩu xác nhận không khớp!' : 'Passwords do not match!',
      })
      return
    }
    setLoginPhone(phone)
    setAction('login')
    setMessage({
      type: 'success',
      text: lang === 'vi' 
        ? 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.' 
        : 'Account registered successfully! Please log in.',
    })
  }

  const handleForgotPassword = () => {
    setMessage({
      type: 'info',
      text: lang === 'vi' 
        ? 'Hướng dẫn khôi phục mật khẩu đã được gửi đến số điện thoại của bạn.' 
        : 'Password recovery instructions sent to your phone number.',
    })
  }

  const setAction = (action: 'login' | 'register') => {
    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set('action', action)
    setSearchParams(nextSearchParams)
    setMessage(null)
  }

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <main className={styles.mainContent}>
        <div className={styles.layoutGrid}>
          {/* Left section: Branding & Highlights */}
          <div className={styles.leftSection}>
            <div className={styles.brandTag}>
              <span className={styles.brandDot} />
              {lang === 'vi' ? 'Hệ thống y tế điện tử eClinic' : 'eClinic Healthcare System'}
            </div>
            
            <h1 className={styles.heroTitle}>
              {lang === 'vi' ? (
                <>Chăm sóc sức khỏe <span className={styles.heroTitleHighlight}>toàn diện</span> cùng eClinic</>
              ) : (
                <>Comprehensive <span className={styles.heroTitleHighlight}>Healthcare</span> with eClinic</>
              )}
            </h1>

            <p className={styles.heroSubtitle}>
              {lang === 'vi' 
                ? 'Đăng nhập hoặc tạo tài khoản để trải nghiệm dịch vụ chăm sóc sức khỏe trực tuyến nhanh chóng, tiện lợi và an toàn.'
                : 'Log in or create an account to experience fast, convenient, and safe online healthcare services.'}
            </p>

            <div className={styles.featuresList}>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>✓</span>
                <span>{lang === 'vi' ? 'Đặt lịch khám nhanh chóng với bác sĩ hàng đầu' : 'Quick appointment booking with top doctors'}</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>✓</span>
                <span>{lang === 'vi' ? 'Quản lý hồ sơ sức khỏe trực tuyến 24/7' : 'Manage health records online 24/7'}</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>✓</span>
                <span>{lang === 'vi' ? 'Bảo mật thông tin cá nhân tuyệt đối' : 'Absolute personal data security'}</span>
              </div>
            </div>
          </div>

          {/* Right section: Auth Card with 2 Tabs */}
          <div className={styles.rightSection}>
            <div className={styles.card}>
              <div className={styles.tabHeader}>
                <button
                  type="button"
                  className={cx(styles.tabBtn, activeAction === 'login' && styles.tabActive)}
                  onClick={() => setAction('login')}
                >
                  {lang === 'vi' ? 'Đăng nhập' : 'Log In'}
                </button>
                <button
                  type="button"
                  className={cx(styles.tabBtn, activeAction === 'register' && styles.tabActive)}
                  onClick={() => setAction('register')}
                >
                  {lang === 'vi' ? 'Đăng ký' : 'Register'}
                </button>
              </div>

              {message && (
                <div
                  className={cx(
                    styles.alertMessage,
                    message.type === 'success' && styles.alertSuccess,
                    message.type === 'info' && styles.alertInfo,
                    message.type === 'error' && styles.alertError,
                  )}
                >
                  {message.text}
                </div>
              )}

              {activeAction === 'login' ? (
                <LoginForm
                  lang={lang}
                  phone={loginPhone}
                  onPhoneChange={setLoginPhone}
                  onSubmit={handleLoginSubmit}
                  onForgotPassword={handleForgotPassword}
                />
              ) : (
                <RegisterForm lang={lang} onSubmit={handleRegisterSubmit} />
              )}

              <div className={styles.staffLinkWrapper}>
                <a
                  href="#login-doctor"
                  className={styles.staffLink}
                  onClick={(e) => {
                    e.preventDefault()
                    window.location.hash = '#login-doctor'
                  }}
                >
                  {lang === 'vi'
                    ? 'Đăng nhập dành cho Admin & Bác sĩ →'
                    : 'Admin & Doctor Login →'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function useSearchParams(): [URLSearchParams, (nextSearchParams: URLSearchParams) => void] {
  const [searchParams, setSearchParamsState] = useState(
    () => new URLSearchParams(window.location.search),
  )

  useEffect(() => {
    const syncSearchParams = () => {
      setSearchParamsState(new URLSearchParams(window.location.search))
    }
    window.addEventListener('popstate', syncSearchParams)
    return () => window.removeEventListener('popstate', syncSearchParams)
  }, [])

  const setSearchParams = (nextSearchParams: URLSearchParams) => {
    const nextUrl = new URL(window.location.href)
    nextUrl.search = nextSearchParams.toString()
    window.history.pushState(window.history.state, '', nextUrl)
    setSearchParamsState(new URLSearchParams(nextSearchParams))
  }

  return [searchParams, setSearchParams]
}
