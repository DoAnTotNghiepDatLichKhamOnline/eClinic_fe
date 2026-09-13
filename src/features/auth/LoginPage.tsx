import { useState } from 'react'
import type { FormEvent } from 'react'
import { Header } from '@/features/landing/components/header/Header'
import { Footer } from '@/features/landing/components/footer/Footer'
import { Button } from '@/components/ui/Button'
import { useLanguage } from '@/context/LanguageContext'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const { lang } = useLanguage()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setMessage({
      type: 'success',
      text: lang === 'vi' ? 'Đăng nhập thành công!' : 'Login successful!',
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

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <main className={styles.mainContent}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.title}>
              {lang === 'vi' ? 'Đăng nhập' : 'Log In'}
            </h1>
            <p className={styles.subtitle}>
              {lang === 'vi' 
                ? 'Đăng nhập vào tài khoản eClinic của bạn' 
                : 'Sign in to your eClinic account'}
            </p>
          </div>

          {message && (
            <div className={`${styles.alertMessage} ${message.type === 'success' ? styles.alertSuccess : styles.alertInfo}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.fieldGroup}>
              <label htmlFor="phone" className={styles.label}>
                {lang === 'vi' ? 'Số điện thoại' : 'Phone Number'}
              </label>
              <input
                id="phone"
                type="tel"
                className={styles.input}
                placeholder={lang === 'vi' ? 'Nhập số điện thoại' : 'Enter phone number'}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="password" className={styles.label}>
                {lang === 'vi' ? 'Mật khẩu' : 'Password'}
              </label>
              <input
                id="password"
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
      </main>

      <Footer />
    </div>
  )
}
