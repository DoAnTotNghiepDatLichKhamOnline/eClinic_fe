import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Header } from '@/features/landing/components/header/Header'
import { Footer } from '@/features/landing/components/footer/Footer'
import { useLanguage } from '@/shared/context/LanguageContext'
import { useAuth } from '@/shared/context/AuthContext'
import { cx } from '@/shared/utils/cx'
import { LoginForm } from './LoginForm'
import styles from './LoginPagePatient.module.css'

export function LoginPagePatient() {
  const { lang } = useLanguage()
  const { login } = useAuth()
  const navigate = useNavigate()

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
      navigate('/')
    }, 600)
  }

  const handleForgotPassword = () => {
    setMessage({
      type: 'info',
      text: lang === 'vi' 
        ? 'Hướng dẫn khôi phục mật khẩu đã được gửi đến số điện thoại của bạn.' 
        : 'Password recovery instructions sent to your phone number.',
    })
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
                ? 'Đăng nhập để đặt lịch khám, theo dõi hồ sơ sức khỏe và kết nối với đội ngũ y tế eClinic.'
                : 'Log in to book appointments, follow your health records, and connect with eClinic care teams.'}
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

          {/* Right section: Patient login */}
          <div className={styles.rightSection}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>{lang === 'vi' ? 'Đăng nhập bệnh nhân' : 'Patient Login'}</h2>
                <p className={styles.cardSubtitle}>
                  {lang === 'vi' ? 'Chào mừng bạn quay lại eClinic' : 'Welcome back to eClinic'}
                </p>
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

              <LoginForm
                lang={lang}
                phone={loginPhone}
                onPhoneChange={setLoginPhone}
                onSubmit={handleLoginSubmit}
                onForgotPassword={handleForgotPassword}
              />

              <div className={styles.registerLinkWrapper}>
                <span>{lang === 'vi' ? 'Chưa có tài khoản?' : "Don't have an account?"}</span>
                <Link to="/register" className={styles.staffLink}>
                  {lang === 'vi' ? 'Đăng ký ngay' : 'Create an account'}
                </Link>
              </div>

              <div className={styles.staffLinkWrapper}>
                <Link to="/doctor/login" className={styles.staffLink}>
                  {lang === 'vi'
                    ? 'Đăng nhập dành cho Admin & Bác sĩ →'
                    : 'Admin & Doctor Login →'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
