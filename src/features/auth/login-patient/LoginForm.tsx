import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/shared/components/ui/Button'
import type { Lang } from '@/shared/types/i18n'
import styles from './LoginPagePatient.module.css'

type LoginFormProps = {
  lang: Lang
  phone: string
  onPhoneChange: (phone: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onForgotPassword: () => void
}

export function LoginForm({ lang, phone, onPhoneChange, onSubmit, onForgotPassword }: LoginFormProps) {
  const [password, setPassword] = useState('')

  return (
    <form onSubmit={onSubmit} className={styles.form}>
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
          value={phone}
          onChange={(event) => onPhoneChange(event.target.value.replace(/\D/g, ''))}
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
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <div className={styles.forgotWrapper}>
          <button type="button" className={styles.forgotBtn} onClick={onForgotPassword}>
            {lang === 'vi' ? 'Quên mật khẩu?' : 'Forgot password?'}
          </button>
        </div>
      </div>

      <Button type="submit" variant="accent" size="lg" className={styles.submitBtn}>
        {lang === 'vi' ? 'Đăng nhập' : 'Log In'}
      </Button>
    </form>
  )
}