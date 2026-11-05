import { useState } from "react";
import type { FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { validateEmail, validatePassword } from "@/utils/formValidators";
import { FieldError } from "@/utils/passwordMatchValidator";
import type { Lang } from "@/types/i18n";
import styles from "./LoginPagePatient.module.css";

type LoginFormProps = {
  lang: Lang;
  email: string;
  onEmailChange: (email: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>, password: string) => void;
  onForgotPassword: () => void;
  onGoogleLogin?: () => void;
  isLoading?: boolean;
};

export function LoginForm({
  lang,
  email,
  onEmailChange,
  onSubmit,
  onForgotPassword,
  onGoogleLogin,
  isLoading = false,
}: LoginFormProps) {
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errEmail = validateEmail(email, lang);
    const errPw = validatePassword(password, lang);

    setEmailError(errEmail);
    setPasswordError(errPw);

    if (errEmail || errPw) {
      return;
    }

    onSubmit(e, password);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.fieldGroup}>
        <label htmlFor="login-email" className={styles.label}>
          {lang === "vi" ? "Địa chỉ Email" : "Email Address"}
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          maxLength={255}
          className={`${styles.input} ${emailError ? "border-rose-400 focus:border-rose-500 ring-1 ring-rose-200" : ""}`}
          placeholder={
            lang === "vi"
              ? "Nhập địa chỉ email của bạn"
              : "Enter your email address"
          }
          value={email}
          onChange={(event) => {
            onEmailChange(event.target.value);
            if (emailError) setEmailError(null);
          }}
          onBlur={() => {
            if (email.trim()) {
              setEmailError(validateEmail(email, lang));
            }
          }}
          disabled={isLoading}
        />
        <FieldError error={emailError} id="login-email-error" />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="login-password" className={styles.label}>
          {lang === "vi" ? "Mật khẩu" : "Password"}
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          className={`${styles.input} ${passwordError ? "border-rose-400 focus:border-rose-500 ring-1 ring-rose-200" : ""}`}
          placeholder={lang === "vi" ? "Nhập mật khẩu" : "Enter password"}
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            if (passwordError) setPasswordError(null);
          }}
          onBlur={() => {
            if (password) {
              setPasswordError(validatePassword(password, lang));
            }
          }}
          disabled={isLoading}
        />
        <FieldError error={passwordError} id="login-password-error" />
        <div className={styles.forgotWrapper}>
          <button
            type="button"
            className={styles.forgotBtn}
            onClick={onForgotPassword}
            disabled={isLoading}
          >
            {lang === "vi" ? "Quên mật khẩu?" : "Forgot password?"}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        variant="accent"
        size="lg"
        className={styles.submitBtn}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{lang === "vi" ? "Đang đăng nhập..." : "Logging in..."}</span>
          </span>
        ) : lang === "vi" ? (
          "Đăng nhập"
        ) : (
          "Log In"
        )}
      </Button>

      {onGoogleLogin && (
        <>
          <div style={{ display: "flex", alignItems: "center", margin: "16px 0", gap: "10px" }}>
            <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>
              {lang === "vi" ? "hoặc đăng nhập với" : "or continue with"}
            </span>
            <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className={styles.googleBtn}
            onClick={onGoogleLogin}
            disabled={isLoading}
          >
            <svg
              className={styles.googleIcon}
              viewBox="0 0 24 24"
              width="18"
              height="18"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google</span>
          </Button>
        </>
      )}
    </form>
  );
}
