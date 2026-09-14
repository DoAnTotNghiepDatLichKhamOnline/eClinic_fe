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

  // Selected role tab: Doctor or Admin
  const [selectedRole, setSelectedRole] = useState<'doctor' | 'admin'>('doctor')

  // Form states - email & password only
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [message, setMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null)

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault()

    const isDoctor = selectedRole === 'doctor' || email.includes('doctor') || email.includes('baksi')
    const role: 'doctor' | 'admin' = isDoctor ? 'doctor' : 'admin'

    login({
      id: `${role}-${Date.now()}`,
      name: email ? (email.split('@')[0]) : (role === 'doctor' ? 'BS. Mattias Larsson' : 'Admin Quản trị'),
      email: email || `${role}@eclinic.vn`,
      role: role,
    })

    const targetHash = role === 'doctor' ? '#doctor' : '#admin'

    setMessage({
      type: 'success',
      text: lang === 'vi' 
        ? `Đăng nhập ${role === 'doctor' ? 'Bác sĩ' : 'Admin'} thành công! Đang chuyển hướng...` 
        : `${role === 'doctor' ? 'Doctor' : 'Admin'} login successful! Redirecting...`,
    })

    setTimeout(() => {
      window.location.hash = targetHash
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
              {lang === 'vi' ? 'Cổng Quản lý & Y tế eClinic' : 'eClinic Management & Medical Portal'}
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
                  {lang === 'vi' ? 'Chọn vai trò Đăng nhập' : 'Select Login Role'}
                </p>
              </div>

              {/* Role selector tabs */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    borderRadius: '8px',
                    border: '1.5px solid',
                    borderColor: selectedRole === 'doctor' ? '#4f46e5' : '#e2e8f0',
                    background: selectedRole === 'doctor' ? '#eef2ff' : '#fff',
                    color: selectedRole === 'doctor' ? '#3730a3' : '#64748b',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedRole('doctor')}
                >
                  🩺 {lang === 'vi' ? 'Bác sĩ' : 'Doctor'}
                </button>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    borderRadius: '8px',
                    border: '1.5px solid',
                    borderColor: selectedRole === 'admin' ? '#4f46e5' : '#e2e8f0',
                    background: selectedRole === 'admin' ? '#eef2ff' : '#fff',
                    color: selectedRole === 'admin' ? '#3730a3' : '#64748b',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedRole('admin')}
                >
                  🛡️ Admin
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

              <form onSubmit={handleLoginSubmit} className={styles.form}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="staff-email" className={styles.label}>
                    {lang === 'vi' ? 'Email nhân viên' : 'Staff Email'}
                  </label>
                  <input
                    id="staff-email"
                    type="email"
                    className={styles.input}
                    placeholder={selectedRole === 'doctor' ? 'baksi@eclinic.vn' : 'admin@eclinic.vn'}
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
                  {lang === 'vi' ? `Đăng nhập ${selectedRole === 'doctor' ? 'Bác sĩ' : 'Admin'}` : `Sign In as ${selectedRole === 'doctor' ? 'Doctor' : 'Admin'}`}
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
