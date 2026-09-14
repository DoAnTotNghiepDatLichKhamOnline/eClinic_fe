import { useState } from 'react'
import type { FormEvent } from 'react'
import { Header } from '@/features/landing/components/header/Header'
import { Footer } from '@/features/landing/components/footer/Footer'
import { Button } from '@/components/ui/Button'
import { useLanguage } from '@/context/LanguageContext'
import { cx } from '@/utils/cx'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const { lang } = useLanguage()
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  // Form states
  const [loginPhone, setLoginPhone] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [regPhone, setRegPhone] = useState('')
  const [regFullName, setRegFullName] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')

  const [message, setMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null)

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault()
    setMessage({
      type: 'success',
      text: lang === 'vi' ? 'Đăng nhập thành công!' : 'Login successful!',
    })
  }

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (regPassword !== regConfirmPassword) {
      setMessage({
        type: 'error',
        text: lang === 'vi' ? 'Mật khẩu xác nhận không khớp!' : 'Passwords do not match!',
      })
      return
    }
    setMessage({
      type: 'success',
      text: lang === 'vi' 
        ? 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.' 
        : 'Account registered successfully! Please log in.',
    })
    setLoginPhone(regPhone)
    setActiveTab('login')
  }

  const handleForgotPassword = () => {
    setMessage({
      type: 'info',
      text: lang === 'vi' 
        ? 'Hướng dẫn khôi phục mật khẩu đã được gửi đến số điện thoại của bạn.' 
        : 'Password recovery instructions sent to your phone number.',
    })
  }

  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab)
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
                  className={cx(styles.tabBtn, activeTab === 'login' && styles.tabActive)}
                  onClick={() => handleTabChange('login')}
                >
                  {lang === 'vi' ? 'Đăng nhập' : 'Log In'}
                </button>
                <button
                  type="button"
                  className={cx(styles.tabBtn, activeTab === 'register' && styles.tabActive)}
                  onClick={() => handleTabChange('register')}
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

              {activeTab === 'login' ? (
                <form onSubmit={handleLoginSubmit} className={styles.form}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="login-phone" className={styles.label}>
                      {lang === 'vi' ? 'Số điện thoại' : 'Phone Number'}
                    </label>
                    <input
                      id="login-phone"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={11}
                      className={styles.input}
                      placeholder={lang === 'vi' ? 'Nhập số điện thoại' : 'Enter phone number'}
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="login-password" className={styles.label}>
                      {lang === 'vi' ? 'Mật khẩu' : 'Password'}
                    </label>
                    <input
                      id="login-password"
                      type="password"
                      className={styles.input}
                      placeholder={lang === 'vi' ? 'Nhập mật khẩu' : 'Enter password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
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
              ) : (
                <form onSubmit={handleRegisterSubmit} className={styles.form}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="reg-phone" className={styles.label}>
                      {lang === 'vi' ? 'Số điện thoại' : 'Phone Number'}
                    </label>
                    <input
                      id="reg-phone"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={11}
                      className={styles.input}
                      placeholder={lang === 'vi' ? 'Nhập số điện thoại' : 'Enter phone number'}
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="reg-fullname" className={styles.label}>
                      {lang === 'vi' ? 'Họ và tên' : 'Full Name'}
                    </label>
                    <input
                      id="reg-fullname"
                      type="text"
                      className={styles.input}
                      placeholder={lang === 'vi' ? 'Nhập họ và tên' : 'Enter full name'}
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="reg-password" className={styles.label}>
                      {lang === 'vi' ? 'Mật khẩu' : 'Password'}
                    </label>
                    <input
                      id="reg-password"
                      type="password"
                      className={styles.input}
                      placeholder={lang === 'vi' ? 'Tạo mật khẩu' : 'Create password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="reg-confirm-password" className={styles.label}>
                      {lang === 'vi' ? 'Xác nhận mật khẩu' : 'Confirm Password'}
                    </label>
                    <input
                      id="reg-confirm-password"
                      type="password"
                      className={styles.input}
                      placeholder={lang === 'vi' ? 'Nhập lại mật khẩu' : 'Re-enter password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" variant="accent" size="lg" className={styles.submitBtn}>
                    {lang === 'vi' ? 'Đăng ký' : 'Register'}
                  </Button>
                </form>
              )}

              <div className={styles.backHomeWrapper}>
                <a
                  href="#"
                  className={styles.backHomeLink}
                  onClick={(e) => {
                    e.preventDefault()
                    window.location.hash = ''
                  }}
                >
                  ← {lang === 'vi' ? 'Quay lại Trang chủ' : 'Back to Home'}
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
