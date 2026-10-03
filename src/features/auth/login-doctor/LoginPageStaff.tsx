import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { useLanguage } from '@/shared/context/LanguageContext'
import { useAuth } from '@/shared/context/AuthContext'
import { cx } from '@/shared/utils/cx'
import styles from './LoginPageStaff.module.css'

export function LoginPageStaff({ role }: { role: 'doctor' | 'admin' }) {
  const { lang } = useLanguage()
  const { login } = useAuth()
  const navigate = useNavigate()

  // Form states - email & password only
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [message, setMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null)

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault()

    login({
      id: `${role}-${Date.now()}`,
      name: email ? (email.split('@')[0]) : (role === 'doctor' ? 'BS. Mattias Larsson' : 'Admin Quản trị'),
      email: email || `${role}@eclinic.vn`,
      role: role,
    })

    setMessage({
      type: 'success',
      text: lang === 'vi' 
        ? `Đăng nhập ${role === 'doctor' ? 'Bác sĩ' : 'Admin'} thành công! Đang chuyển hướng...` 
        : `${role === 'doctor' ? 'Doctor' : 'Admin'} login successful! Redirecting...`,
    })

    setTimeout(() => {
      navigate(role === 'doctor' ? '/doctor' : '/admin')
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
      <main className={styles.mainContent}>
        <div className={styles.layoutGrid}>
          {/* Left section: Staff Branding & Highlights */}
          <div className={styles.leftSection}>
            <div className={styles.brandTag}>
              <span className={styles.brandDot} />
              {lang === 'vi' ? 'Cổng Quản lý & Y tế eClinic' : 'eClinic Management & Medical Portal'}
            </div>
            
            <h1 className={styles.heroTitle}>
              {lang === 'vi' ? (
                <>Cổng đăng nhập <span className={styles.heroTitleHighlight}>{role === 'doctor' ? 'Bác sĩ' : 'Admin'}</span></>
              ) : (
                <><span className={styles.heroTitleHighlight}>{role === 'doctor' ? 'Doctor' : 'Admin'}</span> Portal</>
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
                  {lang === 'vi' ? `Đăng nhập ${role === 'doctor' ? 'Bác sĩ' : 'Admin'}` : `Sign In as ${role === 'doctor' ? 'Doctor' : 'Admin'}`}
                </h2>
                <p className={styles.cardSubtitle}>
                  {lang === 'vi' ? 'Sử dụng email nội bộ của bạn' : 'Use your staff email address'}
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
                    placeholder={role === 'doctor' ? 'baksi@eclinic.vn' : 'admin@eclinic.vn'}
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
                  {lang === 'vi' ? `Đăng nhập ${role === 'doctor' ? 'Bác sĩ' : 'Admin'}` : `Sign In as ${role === 'doctor' ? 'Doctor' : 'Admin'}`}
                </Button>
              </form>

              <div className={styles.patientLinkWrapper}>
                <Link
                  to={role === 'doctor' ? '/admin/login' : '/doctor/login'}
                  className={styles.patientLink}
                >
                  {role === 'doctor'
                    ? (lang === 'vi' ? 'Đăng nhập Admin' : 'Admin Login')
                    : (lang === 'vi' ? 'Đăng nhập Bác sĩ' : 'Doctor Login')}
                </Link>
              </div>

              <div className={styles.patientLinkWrapper}>
                <Link to="/login" className={styles.patientLink}>
                  ← {lang === 'vi' ? 'Bạn là bệnh nhân? Đăng nhập tại đây' : 'Are you a patient? Log in here'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
