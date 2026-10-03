import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/shared/components/ui/Button'
import type { Lang } from '@/shared/types/i18n'
import styles from './LoginPagePatient.module.css'

type RegisterFormProps = {
  lang: Lang
  onSubmit: (phone: string, password: string, confirmPassword: string) => void
}

export function RegisterForm({ lang, onSubmit }: RegisterFormProps) {
  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(phone, password, confirmPassword)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
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
          value={phone}
          onChange={(event) => setPhone(event.target.value.replace(/\D/g, ''))}
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
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
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
          value={password}
          onChange={(event) => setPassword(event.target.value)}
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
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
      </div>

      <Button type="submit" variant="accent" size="lg" className={styles.submitBtn}>
        {lang === 'vi' ? 'Đăng ký' : 'Register'}
      </Button>
    </form>
  )
}