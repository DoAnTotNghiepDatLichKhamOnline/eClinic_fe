import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/shared/components/ui/Button'
import type { Lang } from '@/shared/types/i18n'
import styles from './LoginPagePatient.module.css'

type LoginFormProps = {
  lang: Lang
  email: string
  onEmailChange: (email: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onForgotPassword: () => void
}

export function LoginForm({ lang, email, onEmailChange, onSubmit, onForgotPassword }: LoginFormProps) {
  const [password, setPassword] = useState('')

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.fieldGroup}>
        <label htmlFor="login-email" className={styles.label}>
          {lang === 'vi' ? 'Địa chỉ Email' : 'Email Address'}
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          maxLength={255}
          className={styles.input}
          placeholder={lang === 'vi' ? 'Nhập địa chỉ email của bạn' : 'Enter your email address'}
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
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