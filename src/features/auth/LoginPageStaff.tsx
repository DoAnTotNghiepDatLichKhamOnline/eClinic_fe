import { useState } from 'react'
import type { FormEvent } from 'react'
import { Header } from '@/features/landing/components/header/Header'
import { Footer } from '@/features/landing/components/footer/Footer'
import { Button } from '@/components/ui/Button'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { cx } from '@/utils/cx'
import styles from './LoginPageStaff.module.css'

export function LoginPageStaff() {
  const { lang } = useLanguage()
  const { login } = useAuth()

  // Form states - email & password only
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [message, setMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null)

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault()
    login({
      id: 'staff-' + Date.now(),
      name: email.split('@')[0] || 'Dr. Alex Miller',
      email: email,
      role: email.includes('admin') ? 'admin' : 'doctor',
    })
    setMessage({
      type: 'success',
      text: lang === 'vi' 
        ? 'Đăng nhập nhân viên (Admin/Bác sĩ) thành công! Đang chuyển về Trang chủ...' 
        : 'Staff login successful! Redirecting to Home...',
    })
    setTimeout(() => {
      window.location.hash = ''
    }, 600)
  }

  const handleForgotPassword = () => {
    setMessage({
      type: 'info',
      text: lang === 'vi' 
        ? 'Hướng dẫn khôi phục mật khẩu đã được gửi đến email nội bộ của bạn.' 
        : 'Password recovery instructions sent to your staff email.',
    })
  }

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <main className={styles.mainContent}>
        <div className={styles.layoutGrid}>
          {/* Left section: Staff Branding & Highlights */}
          <div className={styles.leftSection}>
            <div className={styles.brandTag}>
              <span className={styles.brandDot} />
              {lang === 'vi' ? 'Cổng Quản Quản lý & Y tế eClinic' : 'eClinic Management & Medical Portal'}
            </div>
            
            <h1 className={styles.heroTitle}>
              {lang === 'vi' ? (
                <>Cổng đăng nhập <span className={styles.heroTitleHighlight}>Admin & Bác sĩ</span></>
              ) : (
                <>Portal for <span className={styles.heroTitleHighlight}>Admin & Doctors</span></>
              )}
            </h1>

            <p className={styles.heroSubtitle}>
              {lang === 'vi' 
                ? 'Hệ thống quản lý nội bộ dành riêng cho Quản trị viên và Đội ngũ Bác sĩ eClinic.'
                : 'Internal management system dedicated to Administrators and eClinic Doctors.'}
            </p>

            <div className={styles.featuresList}>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>✓</span>
                <span>{lang === 'vi' ? 'Quản lý lịch khám và hồ sơ bệnh án' : 'Manage schedules and medical records'}</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>✓</span>
                <span>{lang === 'vi' ? 'Điều hành hệ thống phòng khám và nhân sự' : 'Manage clinic operations and staff'}</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>✓</span>
                <span>{lang === 'vi' ? 'Bảo mật tiêu chuẩn y tế quốc tế' : 'International medical security standard'}</span>
              </div>
            </div>
          </div>

          {/* Right section: Staff Auth Card (Email & Password Only) */}
          <div className={styles.rightSection}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  {lang === 'vi' ? 'Đăng nhập Nhân viên' : 'Staff Sign In'}
                </h2>
                <p className={styles.cardSubtitle}>
                  {lang === 'vi' ? 'Dành cho Quản trị viên & Bác sĩ' : 'For Admin & Doctors'}
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

              <form onSubmit={handleLoginSubmit} className={styles.form}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="staff-email" className={styles.label}>
                    {lang === 'vi' ? 'Email nhân viên' : 'Staff Email'}
                  </label>
                  <input
                    id="staff-email"
                    type="email"
                    className={styles.input}
                    placeholder={lang === 'vi' ? 'nhanvien@eclinic.vn' : 'staff@eclinic.vn'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="staff-password" className={styles.label}>
                    {lang === 'vi' ? 'Mật khẩu' : 'Password'}
                  </label>
                  <input
                    id="staff-password"
                    type="password"
                    className={styles.input}
                    placeholder={lang === 'vi' ? 'Nhập mật khẩu' : 'Enter password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className={styles.forgotWrapper}>
                    <button
                      type="button"
                      className={styles.forgotBtn}
                      onClick={handleForgotPassword}
                    >
                      {lang === 'vi' ? 'Quên mật khẩu?' : 'Forgot password?'}
                    </button>
                  </div>
                </div>

                <Button type="submit" variant="accent" size="lg" className={styles.submitBtn}>
                  {lang === 'vi' ? 'Đăng nhập' : 'Log In'}
                </Button>
              </form>

              <div className={styles.patientLinkWrapper}>
                <a
                  href="#login"
                  className={styles.patientLink}
                  onClick={(e) => {
                    e.preventDefault()
                    window.location.hash = '#login'
                  }}
                >
                  ← {lang === 'vi' ? 'Bạn là bệnh nhân? Đăng nhập tại đây' : 'Are you a patient? Log in here'}
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
