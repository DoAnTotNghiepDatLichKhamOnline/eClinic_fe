import { useState } from "react";
import type { FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e, password);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.fieldGroup}>
        <label htmlFor="login-email" className={styles.label}>
          {lang === "vi" ? "Địa chỉ Email" : "Email Address"}
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          maxLength={255}
          className={styles.input}
          placeholder={
            lang === "vi"
              ? "Nhập địa chỉ email của bạn"
              : "Enter your email address"
          }
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="login-password" className={styles.label}>
          {lang === "vi" ? "Mật khẩu" : "Password"}
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          className={styles.input}
          placeholder={lang === "vi" ? "Nhập mật khẩu" : "Enter password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          disabled={isLoading}
        />
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
          <button
            type="button"
            onClick={onGoogleLogin}
            disabled={isLoading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "10px 16px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#334155",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>{lang === "vi" ? "Đăng nhập với Google" : "Sign in with Google"}</span>
          </button>
        </>
      )}
    </form>
  );
}
